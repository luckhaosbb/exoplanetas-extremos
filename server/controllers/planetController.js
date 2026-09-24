import { planetService } from '../services/planetService.js';

/**
 * Controller responsável por orquestrar as requisições HTTP
 * relacionadas a Exoplanetas e Banners.
 */
export const planetController = {
  /**
   * GET /api/today
   * Recupera ou gera o exoplaneta diário
   */
  async getToday(req, res) {
    try {
      const isPreview = req.query.preview === 'true';
      const data = await planetService.getDailyPlanet({ isPreview });
      return res.json(data);
    } catch (error) {
      console.error('❌ [PLANET CONTROLLER] Erro ao obter exoplaneta diário:', error);
      return res.status(500).json({
        success: false,
        error: 'Falha interna ao recuperar o exoplaneta diário.'
      });
    }
  },

  /**
   * POST /api/save-banner
   * Arquiva o pôster gerado pelo cliente no banco
   */
  async saveBanner(req, res) {
    try {
      const { dateStr, bannerDataUrl } = req.body;

      if (!bannerDataUrl) {
        return res.status(400).json({
          success: false,
          error: 'Dados do banner ausentes.'
        });
      }

      const updated = await planetService.saveBanner(dateStr, bannerDataUrl);

      if (updated) {
        return res.json({
          success: true,
          message: 'Banner arquivado no banco de dados com sucesso.'
        });
      }

      return res.status(404).json({
        success: false,
        error: 'Registro diário do planeta não encontrado para a data especificada.'
      });
    } catch (error) {
      console.error('❌ [PLANET CONTROLLER] Erro ao salvar banner:', error);
      return res.status(500).json({
        success: false,
        error: 'Falha interna ao salvar o banner.'
      });
    }
  },

  /**
   * GET /api/stats
   * Retorna estatísticas gerais do acervo
   */
  async getStats(req, res) {
    try {
      const stats = await planetService.getStats();
      return res.json({
        success: true,
        ...stats
      });
    } catch (error) {
      console.error('❌ [PLANET CONTROLLER] Erro ao consultar estatísticas:', error);
      return res.status(500).json({
        success: false,
        error: 'Falha interna ao obter estatísticas.'
      });
    }
  },

  /**
   * POST/GET /api/reset-planets
   * Reseta a base de planetas para o lançamento oficial
   */
  async resetPlanets(req, res) {
    try {
      const { planetRepository } = await import('../repositories/planetRepository.js');
      await planetRepository.clearAll();
      return res.json({
        success: true,
        message: 'Tabela de planetas resetada com sucesso para a grande estreia!'
      });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
};
