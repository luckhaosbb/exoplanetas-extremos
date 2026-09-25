import { planetService } from '../services/planetService.js';
import { config } from '../config/index.js';

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
  },

  /**
   * GET /api/curadoria
   * Retorna os 7 exoplanetas da semana com numeração sequencial de issues,
   * datas programadas e status das imagens para a curadoria do autor.
   */
  async getCuradoria(req, res) {
    try {
      // Validação de token de segurança confidencial do autor
      const providedSecret = req.query.secret || req.headers['x-curadoria-secret'];
      if (!providedSecret || providedSecret !== config.curadoriaSecret) {
        return res.status(403).json({
          success: false,
          error: 'Acesso restrito ao observatório de curadoria. Chave secreta inválida ou não fornecida.'
        });
      }

      const { EXOPLANETS_CATALOG } = await import('../data/exoplanets.js');
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const planetsAssetDir = path.join(__dirname, '..', '..', 'public', 'assets', 'planets');
      const distAssetDir = path.join(__dirname, '..', '..', 'dist', 'assets', 'planets');

      const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
      const weekPlanets = EXOPLANETS_CATALOG.slice(0, 7).map((planet, idx) => {
        const issueNum = idx + 1;
        const imgFileName = `${planet.id}.jpg`;
        const imgFullPath = path.join(planetsAssetDir, imgFileName);
        const distFullPath = path.join(distAssetDir, imgFileName);
        const hasImage = fs.existsSync(imgFullPath) || fs.existsSync(distFullPath);

        const d = new Date();
        d.setDate(d.getDate() + idx);
        const dateStr = d.toISOString().slice(0, 10);

        return {
          issueNumber: issueNum,
          issueLabel: `ISSUE #${String(issueNum).padStart(3, '0')}`,
          dayName: daysOfWeek[idx] || `Dia ${idx + 1}`,
          scheduledDate: dateStr,
          hasArtwork: hasImage,
          artworkUrl: `/assets/planets/${imgFileName}`,
          planet: {
            ...planet,
            issueNumber: issueNum,
            bannerOrientation: planet.bannerOrientation || 'vertical'
          }
        };
      });

      return res.json({
        success: true,
        totalScheduled: weekPlanets.length,
        weekSchedule: weekPlanets,
        serverTimestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro no endpoint de curadoria:', error);
      return res.status(500).json({ success: false, error: 'Falha ao recuperar grade de curadoria.' });
    }
  }
};
