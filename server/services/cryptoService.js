import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Service responsável pela emissão e validação de certificados
 * criptográficos de autenticidade (padrão NFT-like) com HMAC-SHA256.
 * Segue o Princípio da Responsabilidade Única (SRP).
 */
export const cryptoService = {
  /**
   * Gera certificado criptográfico assinado pelo backend
   * @param {string} planetId
   * @param {string} dateStr (formato YYYY-MM-DD)
   * @returns {object} Certificado oficial com assinatura HMAC-SHA256
   */
  generateCertificate(planetId, dateStr) {
    const serial = crypto.randomUUID().slice(0, 8).toUpperCase();
    const payload = `${planetId}:${dateStr}:${serial}`;
    const signature = crypto
      .createHmac('sha256', config.serverSecretKey)
      .update(payload)
      .digest('hex')
      .toUpperCase();

    return {
      tokenId: `TOKEN#EXO-${dateStr.replace(/-/g, '')}-${serial}`,
      signature: `SHA256:${signature}`,
      serial: serial,
      payload: payload,
      issuedAt: new Date().toISOString(),
      issuer: 'NASA Cosmic Archive Protocol • Lucas Gomes'
    };
  },

  /**
   * Valida a integridade da assinatura criptográfica de um token
   * @param {object} params { planetId, dateStr, serial, signature }
   * @returns {object} Resultado da validação
   */
  verifyCertificate({ planetId, dateStr, serial, signature }) {
    if (!planetId || !dateStr || !serial || !signature) {
      return {
        valid: false,
        error: 'Parâmetros incompletos para validação criptográfica.'
      };
    }

    const payload = `${planetId}:${dateStr}:${serial}`;
    const expectedSignature = `SHA256:${crypto
      .createHmac('sha256', config.serverSecretKey)
      .update(payload)
      .digest('hex')
      .toUpperCase()}`;

    const isValid = expectedSignature === signature;

    return {
      valid: isValid,
      planetId,
      dateStr,
      serial,
      message: isValid
        ? `✅ CERTIFICADO OFICIAL VÁLIDO! Este drop foi autenticado como emitido em ${dateStr} para ${planetId}.`
        : `❌ CERTIFICADO INVÁLIDO OU ADULTERADO! A assinatura criptográfica não confere com o servidor.`
    };
  }
};
