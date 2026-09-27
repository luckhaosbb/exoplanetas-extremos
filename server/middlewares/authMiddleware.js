import { authService } from '../services/authService.js';

/**
 * Middleware que bloqueia requisições não autorizadas para rotas administrativas do autor/curador
 */
export function requireCuratorAuth(req, res, next) {
  if (authService.isRequestAuthenticated(req)) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Acesso restrito ao observatório de curadoria. Sessão inválida, expirada ou não fornecida.'
  });
}
