import { subscriberService } from '../services/subscriberService.js';

/**
 * Controller responsável pelas inscrições de novos usuários na newsletter.
 */
export const subscriberController = {
  /**
   * POST /api/subscribe
   * Inscreve um e-mail para receber alertas diários
   */
  async subscribe(req, res) {
    try {
      const { email } = req.body;
      const result = await subscriberService.subscribe(email);

      if (!result.success) {
        return res.status(result.statusCode || 400).json({
          success: false,
          error: result.error
        });
      }

      return res.status(result.statusCode || 200).json({
        success: true,
        alreadySubscribed: result.alreadySubscribed,
        message: result.message
      });
    } catch (error) {
      console.error('❌ [SUBSCRIBER CONTROLLER] Erro ao processar inscrição:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao processar a inscrição.'
      });
    }
  }
};
