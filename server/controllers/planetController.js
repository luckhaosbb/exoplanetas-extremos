import { planetService } from '../services/planetService.js';
import { config } from '../config/index.js';
import { authService } from '../services/authService.js';

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
      const isCurator = authService.isRequestAuthenticated(req);
      const isLocal = !config.isProduction || req.hostname === 'localhost' || req.hostname === '127.0.0.1';
      const planetId = req.query.planet;
      const issueNum = req.query.issue ? parseInt(req.query.issue, 10) : null;

      const data = await planetService.getDailyPlanet({
        isPreview: isPreview && (isCurator || isLocal),
        isCurator: isCurator || isLocal,
        planetId,
        issueNum
      });

      if (data.forbidden) {
        return res.status(403).json(data);
      }

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
      if (!authService.isRequestAuthenticated(req)) {
        return res.status(401).json({
          success: false,
          error: 'Acesso restrito ao observatório de curadoria. Sessão inválida ou não fornecida.'
        });
      }

      const weekSchedule = await planetService.getCuradoriaSchedule();

      return res.json({
        success: true,
        totalScheduled: weekSchedule.length,
        weekSchedule,
        serverTimestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro no endpoint de curadoria:', error);
      return res.status(500).json({ success: false, error: 'Falha ao recuperar grade de curadoria.' });
    }
  },

  /**
   * POST /api/curadoria/regenerate
   * Regenera a arte de um exoplaneta específico via Google Imagen 3
   */
  async regenerateArtwork(req, res) {
    try {
      if (!authService.isRequestAuthenticated(req)) {
        return res.status(401).json({
          success: false,
          error: 'Acesso restrito ao observatório de curadoria.'
        });
      }

      const { planetId } = req.body;
      if (!planetId || typeof planetId !== 'string' || !/^[a-zA-Z0-9_-]{2,64}$/.test(planetId)) {
        return res.status(400).json({
          success: false,
          error: 'Identificador de planeta inválido ou ausente.'
        });
      }

      const result = await planetService.regeneratePlanetArtwork(planetId);
      return res.json({
        success: true,
        message: `Arte de ${planetId} regenerada com sucesso via Google Imagen 3.`,
        artworkUrl: result.artworkUrl
      });
    } catch (error) {
      console.error('❌ Erro ao regenerar arte de planeta:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Falha ao regenerar arte de exoplaneta.'
      });
    }
  },

  /**
   * POST /api/curadoria/run-weekly-cycle
   * Dispara sob demanda o agendamento da próxima semana e fila de IA
   */
  async triggerWeeklyCycle(req, res) {
    try {
      if (!authService.isRequestAuthenticated(req)) {
        return res.status(401).json({
          success: false,
          error: 'Acesso restrito ao observatório de curadoria.'
        });
      }

      const forceRegenerate = req.body?.forceRegenerate === true;
      const result = await planetService.runWeeklyCurationCycle({ forceRegenerate });

      return res.json({
        success: true,
        message: 'Ciclo semanal executado com sucesso.',
        ...result
      });
    } catch (error) {
      console.error('❌ Erro ao disparar ciclo semanal sob demanda:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Falha ao executar ciclo semanal.'
      });
    }
  },

  /**
   * POST /api/curadoria/upload-artwork
   * Permite ao curador fazer upload manual ou arrastar uma arte gerada no Gemini Advanced Pro Web
   */
  async uploadArtwork(req, res) {
    try {
      if (!authService.isRequestAuthenticated(req)) {
        return res.status(401).json({
          success: false,
          error: 'Acesso restrito ao observatório de curadoria.'
        });
      }

      const { planetId, imageBase64 } = req.body;
      if (!planetId || typeof planetId !== 'string' || !/^[a-zA-Z0-9_-]{2,64}$/.test(planetId)) {
        return res.status(400).json({
          success: false,
          error: 'Identificador de planeta inválido ou ausente.'
        });
      }

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Arquivo ou base64 da imagem ausente.'
        });
      }

      // Remove header data:image/...;base64, se presente
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');

      if (buffer.length < 5000) {
        return res.status(400).json({
          success: false,
          error: 'Arquivo de imagem corrompido ou payload muito pequeno.'
        });
      }

      const { aiImageService } = await import('../services/aiImageService.js');
      const artworkUrl = aiImageService.saveArtworkBuffer(planetId, buffer);

      console.log(`🎨 [CURADORIA UPLOAD] Nova arte oficial salva para "${planetId}" (${(buffer.length / 1024).toFixed(1)} KB).`);

      return res.json({
        success: true,
        message: `Arte de ${planetId} enviada e arquivada com sucesso!`,
        artworkUrl: `${artworkUrl}?v=${Date.now()}`
      });
    } catch (error) {
      console.error('❌ Erro no upload de arte de curadoria:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Falha ao processar upload de arte.'
      });
    }
  }
};
