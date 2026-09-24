import { cryptoService } from '../services/cryptoService.js';

/**
 * Controller responsável por validações criptográficas de autenticidade.
 */
export const cryptoController = {
  /**
   * POST /api/verify-token
   * Valida se um token de autenticidade é genuíno
   */
  verifyToken(req, res) {
    try {
      const { planetId, dateStr, serial, signature } = req.body;

      if (!planetId || !dateStr || !serial || !signature) {
        return res.status(400).json({
          valid: false,
          error: 'Parâmetros incompletos para validação.'
        });
      }

      const result = cryptoService.verifyCertificate({ planetId, dateStr, serial, signature });
      return res.json(result);
    } catch (error) {
      console.error('❌ [CRYPTO CONTROLLER] Erro ao validar assinatura:', error);
      return res.status(500).json({
        valid: false,
        error: 'Falha interna ao validar o certificado.'
      });
    }
  }
};
