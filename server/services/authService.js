import crypto from 'crypto';
import { config } from '../config/index.js';

/**
 * Utilitário de comparação em tempo constante para evitar ataques de temporização (Timing Attacks).
 * Hasheamos ambas as entradas com SHA-256 antes da comparação para garantir buffers de mesmo comprimento.
 */
function timingSafeEqualStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export const authService = {
  /**
   * Valida a senha do curador contra o segredo de ambiente configurado
   */
  verifyCuratorPassword(inputPassword) {
    if (!inputPassword || typeof inputPassword !== 'string') return false;
    const target = config.curadoriaPassword || config.curadoriaSecret;
    return timingSafeEqualStrings(inputPassword, target);
  },

  /**
   * Emite um token de sessão assinado com HMAC-SHA256 (24 horas de validade)
   */
  generateCuratorToken() {
    const payload = JSON.stringify({
      role: 'curator',
      exp: Date.now() + 24 * 60 * 60 * 1000,
      iat: Date.now(),
      nonce: crypto.randomBytes(16).toString('hex')
    });

    const b64Payload = Buffer.from(payload).toString('base64url');
    const signature = crypto
      .createHmac('sha256', config.serverSecretKey)
      .update(b64Payload)
      .digest('base64url');

    return `${b64Payload}.${signature}`;
  },

  /**
   * Valida a integridade e validade temporal do token de curador
   */
  verifyCuratorToken(token) {
    if (!token || typeof token !== 'string') return false;

    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [b64Payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', config.serverSecretKey)
      .update(b64Payload)
      .digest('base64url');

    if (!timingSafeEqualStrings(signature, expectedSignature)) {
      return false;
    }

    try {
      const payloadStr = Buffer.from(b64Payload, 'base64url').toString('utf-8');
      const payload = JSON.parse(payloadStr);

      if (payload.role !== 'curator') return false;
      if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return false;

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Extrai e valida o token a partir de headers ou query params de uma requisição Express
   */
  isRequestAuthenticated(req) {
    let token = null;

    // 1. Authorization: Bearer <token>
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }

    // 2. Header customizado x-curator-token
    if (!token && req.headers['x-curator-token']) {
      token = req.headers['x-curator-token'];
    }

    // 3. Query param token ou secret (usado para tags <img> e downloads diretos)
    if (!token && req.query) {
      token = req.query.token || req.query.secret;
    }

    return this.verifyCuratorToken(token);
  }
};
