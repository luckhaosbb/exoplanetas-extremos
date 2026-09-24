import { config } from '../config/index.js';
import { planetRepository } from '../repositories/planetRepository.js';
import { cryptoService } from './cryptoService.js';
import { EXOPLANETS_CATALOG } from '../data/exoplanets.js';

/**
 * Service de Domínio para gerenciamento do ciclo de vida dos Exoplanetas.
 * Aplica Regras de Negócio: rotação diária sem repetição, emissão de certificados
 * criptográficos, numeração sequencial de edições (Issues) e persistência de banners.
 */
export const planetService = {
  /**
   * Retorna a data no formato ISO YYYY-MM-DD
   * @param {number} offsetDays
   * @returns {string}
   */
  getTodayDateString(offsetDays = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * Obtém o exoplaneta do dia atual ou realiza a publicação automática do próximo planeta inédito
   * @param {object} [options]
   * @param {string} [options.customDateStr]
   * @param {boolean} [options.isPreview]
   * @returns {Promise<object>}
   */
  async getDailyPlanet({ customDateStr = null, isPreview = false } = {}) {
    // Se o modo 'Em Breve' estiver ativo e não for requisição de pré-visualização, oculta o planeta
    if (config.comingSoon && !isPreview) {
      return {
        success: true,
        comingSoon: true,
        launchDate: config.launchDate,
        message: 'Primeiro Drop Oficial em Breve! Sintonização telemetrica em andamento.',
        serverTimestamp: new Date().toISOString()
      };
    }

    const today = customDateStr || this.getTodayDateString();

    // 1. Verifica se já existe um planeta publicado para a data
    let publishedRecord = await planetRepository.getByDate(today);
    let chosenPlanet = null;

    if (publishedRecord) {
      chosenPlanet = EXOPLANETS_CATALOG.find(p => p.id === publishedRecord.planet_id);
    }

    // 2. Se ainda não publicado para esta data, seleciona o próximo planeta inédito
    if (!chosenPlanet) {
      const publishedIds = await planetRepository.getAllPublishedIds();
      let availablePlanets = EXOPLANETS_CATALOG.filter(p => !publishedIds.includes(p.id));

      if (availablePlanets.length === 0) {
        console.log('🔄 [PLANET SERVICE] Todos os exoplanetas do catálogo já foram publicados! Iniciando novo ciclo galáctico.');
        availablePlanets = [...EXOPLANETS_CATALOG];
      }

      chosenPlanet = availablePlanets[0];

      publishedRecord = await planetRepository.save({
        planetId: chosenPlanet.id,
        planetName: chosenPlanet.name,
        dateStr: today,
        bannerOrientation: chosenPlanet.bannerOrientation || 'vertical',
        bannerData: null
      });

      console.log(`🚀 [DROP DIÁRIO] Novo Exoplaneta publicado para ${today}: ${chosenPlanet.name} (${chosenPlanet.bannerOrientation})`);
    }

    // 3. Emite o certificado criptográfico assinado pelo backend
    const certificate = cryptoService.generateCertificate(chosenPlanet.id, today);

    // 4. Determina a numeração da edição (Issue #001, #002...)
    const issueNumber = publishedRecord?.id || 1;

    return {
      success: true,
      publishedDate: today,
      planet: chosenPlanet,
      issueNumber: issueNumber,
      bannerOrientation: chosenPlanet.bannerOrientation || 'vertical',
      cryptoCertificate: certificate,
      hasSavedBanner: !!(publishedRecord && publishedRecord.banner_data),
      serverTimestamp: new Date().toISOString()
    };
  },

  /**
   * Salva o pôster A4 renderizado pelo cliente para arquivamento no banco
   * @param {string} dateStr
   * @param {string} bannerDataUrl
   * @returns {Promise<boolean>}
   */
  async saveBanner(dateStr, bannerDataUrl) {
    const targetDate = dateStr || this.getTodayDateString();
    return await planetRepository.updateBanner(targetDate, bannerDataUrl);
  },

  /**
   * Obtém métricas estatísticas da base de dados e do catálogo
   * @returns {Promise<object>}
   */
  async getStats() {
    const totalPublished = await planetRepository.count();
    return {
      totalCatalogPlanets: EXOPLANETS_CATALOG.length,
      publishedPlanetsCount: totalPublished
    };
  }
};
