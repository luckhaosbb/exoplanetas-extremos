import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Service responsável pela emissão e validação de certificados
 * criptográficos de autenticidade (padrão NFT-like) com HMAC-SHA256
 * e protocolo de Tiragem Numerada de Colecionador.
 * Segue o Princípio da Responsabilidade Única (SRP).
 */
export const cryptoService = {
  /**
   * Compara duas strings de forma segura contra timing attacks
   */
  safeCompare(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    const bufA = crypto.createHash('sha256').update(a).digest();
    const bufB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(bufA, bufB);
  },

  /**
   * Gera certificado criptográfico oficial com HMAC-SHA256
   * Suporta chamada por objeto ou argumentos posicionais com retrocompatibilidade
   * @param {string|object} planetIdOrOpts
   * @param {string} [dateStrArg]
   * @param {number} [mintNumberArg=1]
   * @param {string} [collectorNameArg='Colecionador Oficial']
   * @returns {object} Certificado oficial com assinatura HMAC-SHA256
   */
  generateCertificate(planetIdOrOpts, dateStrArg, mintNumberArg = 1, collectorNameArg = 'Colecionador Oficial') {
    let planetId, dateStr, mintNumber, collectorName;

    if (typeof planetIdOrOpts === 'object' && planetIdOrOpts !== null) {
      planetId = planetIdOrOpts.planetId;
      dateStr = planetIdOrOpts.dateStr;
      mintNumber = planetIdOrOpts.mintNumber ?? 1;
      collectorName = planetIdOrOpts.collectorName ?? 'Colecionador Oficial';
    } else {
      planetId = planetIdOrOpts;
      dateStr = dateStrArg;
      mintNumber = mintNumberArg ?? 1;
      collectorName = collectorNameArg ?? 'Colecionador Oficial';
    }

    const cleanCollector = (collectorName || 'Colecionador Oficial').trim();
    const cleanMint = parseInt(mintNumber, 10) || 1;
    const formattedMint = String(cleanMint).padStart(4, '0');
    const serial = crypto.randomUUID().slice(0, 8).toUpperCase();

    // Payload assinado combinando identificador cósmico, data, número de tiragem e titularidade
    const payload = `${planetId}:${dateStr}:${cleanMint}:${cleanCollector}:${serial}`;
    const signature = crypto
      .createHmac('sha256', config.serverSecretKey)
      .update(payload)
      .digest('hex')
      .toUpperCase();

    const tokenId = `TOKEN#EXO-${dateStr.replace(/-/g, '')}-${formattedMint}-${serial.slice(0, 4)}`;

    return {
      tokenId,
      signature: `SHA256:${signature}`,
      serial,
      dateStr,
      mintNumber: cleanMint,
      mintLabel: `EDIÇÃO #${formattedMint}`,
      collectorName: cleanCollector,
      payload,
      issuedAt: new Date().toISOString(),
      issuer: 'NASA Cosmic Archive Protocol • Lucas Gomes'
    };
  },

  /**
   * Valida a integridade da assinatura criptográfica de um token
   * Suporta validação com e sem tiragem numerada (retrocompatível)
   * @param {object} params { planetId, dateStr, mintNumber, collectorName, serial, signature }
   * @returns {object} Resultado da validação
   */
  verifyCertificate({ planetId, dateStr, mintNumber = null, collectorName = null, serial, signature }) {
    if (!planetId || !dateStr || !serial || !signature) {
      return {
        valid: false,
        error: 'Parâmetros incompletos para validação criptográfica.'
      };
    }

    const cleanCollector = (collectorName || 'Colecionador Oficial').trim();
    const cleanMint = mintNumber ? parseInt(mintNumber, 10) : null;

    // 1. Testa com os dados de Tiragem Numerada (se mintNumber estiver disponível)
    if (cleanMint) {
      const payloadWithMint = `${planetId}:${dateStr}:${cleanMint}:${cleanCollector}:${serial}`;
      const expectedWithMint = `SHA256:${crypto
        .createHmac('sha256', config.serverSecretKey)
        .update(payloadWithMint)
        .digest('hex')
        .toUpperCase()}`;

      if (this.safeCompare(expectedWithMint, signature)) {
        return {
          valid: true,
          planetId,
          dateStr,
          mintNumber: cleanMint,
          mintLabel: `EDIÇÃO #${String(cleanMint).padStart(4, '0')}`,
          collectorName: cleanCollector,
          serial,
          message: `✅ CERTIFICADO OFICIAL VÁLIDO! Exemplar Nº #${String(cleanMint).padStart(4, '0')} autenticado para "${cleanCollector}".`
        };
      }
    }

    // 2. Fallback: Testa o formato original de payload legado (${planetId}:${dateStr}:${serial})
    const payloadLegacy = `${planetId}:${dateStr}:${serial}`;
    const expectedLegacy = `SHA256:${crypto
      .createHmac('sha256', config.serverSecretKey)
      .update(payloadLegacy)
      .digest('hex')
      .toUpperCase()}`;

    if (this.safeCompare(expectedLegacy, signature)) {
      return {
        valid: true,
        planetId,
        dateStr,
        mintNumber: cleanMint || 1,
        mintLabel: cleanMint ? `EDIÇÃO #${String(cleanMint).padStart(4, '0')}` : 'EDIÇÃO ORIGINAL',
        collectorName: cleanCollector,
        serial,
        message: `✅ CERTIFICADO OFICIAL VÁLIDO! Este drop foi autenticado como emitido em ${dateStr} para ${planetId}.`
      };
    }

    return {
      valid: false,
      planetId,
      dateStr,
      serial,
      message: `❌ CERTIFICADO INVÁLIDO OU ADULTERADO! A assinatura criptográfica não confere com o servidor.`
    };
  }
};
