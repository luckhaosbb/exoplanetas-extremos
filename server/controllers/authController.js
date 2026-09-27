import { authService } from '../services/authService.js';

// Mecanismo simples em memória para controle de tentativas de login por IP
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutos

function isIpRateLimited(ip) {
  const record = loginAttempts.get(ip);
  if (!record) return false;

  if (Date.now() > record.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }

  return record.attempts >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip) {
  const record = loginAttempts.get(ip) || { attempts: 0, resetAt: Date.now() + LOCKOUT_MS };
  record.attempts += 1;
  loginAttempts.set(ip, record);
}

function resetAttempts(ip) {
  loginAttempts.delete(ip);
}

export const authController = {
  /**
   * POST /api/curadoria/login
   */
  login(req, res) {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';

    if (isIpRateLimited(clientIp)) {
      return res.status(429).json({
        success: false,
        error: 'Muitas tentativas incorretas. Por motivos de segurança, tente novamente em 15 minutos.'
      });
    }

    const { password } = req.body || {};

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Senha não informada.'
      });
    }

    const isValid = authService.verifyCuratorPassword(password);

    if (!isValid) {
      recordFailedAttempt(clientIp);
      return res.status(401).json({
        success: false,
        error: 'Credencial inválida para o Observatório do Autor.'
      });
    }

    resetAttempts(clientIp);
    const token = authService.generateCuratorToken();

    return res.json({
      success: true,
      token,
      expiresIn: 86400,
      message: 'Acesso autorizado ao Observatório do Autor.'
    });
  },

  /**
   * GET /api/curadoria/verify
   */
  verify(req, res) {
    const isAuth = authService.isRequestAuthenticated(req);
    if (!isAuth) {
      return res.status(401).json({ success: false, authenticated: false });
    }
    return res.json({ success: true, authenticated: true });
  },

  /**
   * POST /api/curadoria/logout
   */
  logout(req, res) {
    return res.json({
      success: true,
      message: 'Sessão encerrada com sucesso.'
    });
  }
};
