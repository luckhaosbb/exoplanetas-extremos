import { config } from '../config/index.js';
import { planetRepository } from '../repositories/planetRepository.js';
import { cryptoService } from './cryptoService.js';
import { EXOPLANETS_CATALOG } from '../data/exoplanets.js';
import { aiImageService } from './aiImageService.js';
import { nasaService } from './nasaService.js';
import { HOMOLOGATED_PROMPTS_GEMINI, buildPlanetPrompt } from '../data/prompts.js';

const DAYS_OF_WEEK = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo'
];

/**
 * Service de Domínio para gerenciamento do ciclo de vida dos Exoplanetas.
 * Aplica Regras de Negócio: ciclos semanais fechados (Segunda a Domingo) agendados no Sábado,
 * rotação diária sem repetição, emissão de certificados criptográficos, numeração sequencial
 * de edições (Issues), automação via NASA Exoplanet Archive TAP API e geração de artes.
 */
export const planetService = {
  /**
   * Retorna a data no formato ISO YYYY-MM-DD no Horário Oficial de Brasília (America/Sao_Paulo)
   * @param {number} offsetDays
   * @param {Date} [baseDate]
   * @returns {string}
   */
  getTodayDateString(offsetDays = 0, baseDate = new Date()) {
    const d = new Date(baseDate);
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  },

  /**
   * Obtém o objeto do planeta a partir do catálogo local ou da base estendida da NASA
   * @param {string} planetId
   * @returns {object|null}
   */
  getPlanetById(planetId) {
    if (!planetId) return null;
    let planet = EXOPLANETS_CATALOG.find(p => p.id === planetId);
    if (!planet) {
      planet = nasaService.getPlanetById(planetId);
    }
    return planet || null;
  },

  /**
   * Calcula as 7 datas exatas da próxima semana (Segunda a Domingo) baseando-se no Horário de Brasília.
   * No sábado (dia 6), faltam 2 dias para a próxima segunda-feira.
   * @param {Date} [referenceDate]
   * @returns {Array<{ dayIndex: number, dayName: string, dateStr: string }>}
   */
  getNextWeekDays(referenceDate = new Date()) {
    const brtTodayStr = this.getTodayDateString(0, referenceDate);
    const [year, month, day] = brtTodayStr.split('-').map(Number);
    const refDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
    const currentDay = refDate.getUTCDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    
    // Distância em dias até a próxima Segunda-feira:
    // Se hoje é Domingo (0): próxima segunda é em 1 dia
    // Se hoje é Segunda (1): próxima segunda é em 7 dias
    // Se hoje é Sábado (6): próxima segunda é em 2 dias
    let daysUntilNextMonday = (8 - currentDay) % 7;
    if (daysUntilNextMonday === 0) daysUntilNextMonday = 7;

    const nextMonday = new Date(refDate);
    nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilNextMonday);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(nextMonday);
      d.setUTCDate(d.getUTCDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      weekDays.push({
        dayIndex: i,
        dayName: DAYS_OF_WEEK[i],
        dateStr
      });
    }

    return weekDays;
  },

  /**
   * Ciclo Semanal Automatizado (Executado todo Sábado às 00:00 BRT ou sob demanda).
   * 1. Trava e agenda os 7 exoplanetas para a próxima semana (Segunda a Domingo).
   * 2. Reconhece se a próxima segunda-feira (ex: 05/10) já possui o 8º exoplaneta bônus e o preserva.
   * 3. Busca na NASA Exoplanet Archive TAP API os exoplanetas extremos restantes (ex: 06 a 11 de outubro).
   * 4. Persiste no banco de dados.
   * 5. Dispara a fila de geração de artes no motor de IA configurado.
   */
  async runWeeklyCurationCycle({ forceRegenerate = false, onProgress = null } = {}) {
    console.log('\n======================================================');
    console.log('🪐 [CICLO SEMANAL] Iniciando agendamento automatizado da próxima semana...');
    console.log('======================================================\n');

    const nextWeekDays = this.getNextWeekDays();
    const publishedIds = await planetRepository.getAllPublishedIds();

    // Filtra planetas ainda não agendados/publicados no catálogo local
    let availablePlanets = EXOPLANETS_CATALOG.filter(p => !publishedIds.includes(p.id));

    // Determina quantos planetas inéditos serão necessários para os dias sem agendamento
    const unassignedDays = [];
    for (const item of nextWeekDays) {
      const existing = await planetRepository.getByDate(item.dateStr);
      if (!existing) {
        unassignedDays.push(item);
      }
    }

    // Se os planetas locais não forem suficientes, busca os restantes diretamente na API da NASA
    let nasaPlanets = [];
    const neededFromNasa = Math.max(0, unassignedDays.length - availablePlanets.length);
    if (neededFromNasa > 0) {
      console.log(`📡 [CICLO SEMANAL] Catálogo local com ${availablePlanets.length} restantes. Buscando ${neededFromNasa} exoplanetas adicionais na NASA TAP API...`);
      const excludeIds = [...publishedIds, ...availablePlanets.map(p => p.id)];
      nasaPlanets = await nasaService.fetchExtremePlanets(neededFromNasa, excludeIds);
    }

    const scheduledWeek = [];
    const planetsNeedingArtwork = [];

    for (let i = 0; i < nextWeekDays.length; i++) {
      const { dayName, dateStr } = nextWeekDays[i];

      // 1. Verifica se já havia agendamento prévio para essa data (ex: GJ 1214b em 05/10)
      let record = await planetRepository.getByDate(dateStr);
      let planet = null;

      if (record) {
        planet = this.getPlanetById(record.planet_id);
        if (planet) {
          console.log(`📌 [AGENDAMENTO EXISTENTE] ${dayName} (${dateStr}): ${planet.name} já agendado (Issue #${record.id})`);
        }
      }

      // 2. Se a data ainda não estiver agendada, preenche com o próximo planeta (Local ou NASA)
      if (!planet) {
        if (availablePlanets.length > 0) {
          planet = availablePlanets.shift();
        } else if (nasaPlanets.length > 0) {
          planet = nasaPlanets.shift();
          console.log(`🌌 [NASA INTEGRATION] Agendando novo exoplaneta extremo da NASA: ${planet.name} para ${dateStr}`);
        } else {
          // Fallback de segurança: busca novos da NASA
          const freshNasa = await nasaService.fetchExtremePlanets(1, publishedIds);
          planet = freshNasa[0] || EXOPLANETS_CATALOG[i % EXOPLANETS_CATALOG.length];
        }

        record = await planetRepository.save({
          planetId: planet.id,
          planetName: planet.name,
          dateStr: dateStr,
          bannerOrientation: planet.bannerOrientation || 'vertical',
          bannerData: null
        });

        console.log(`📅 [NOVO AGENDAMENTO] ${dayName} (${dateStr}): ${planet.name} (Issue #${record.id})`);
      }

      const issueNum = record.id;
      const certificate = cryptoService.generateCertificate(planet.id, dateStr);

      scheduledWeek.push({
        issueNumber: issueNum,
        issueLabel: `ISSUE #${String(issueNum).padStart(3, '0')}`,
        dayName,
        scheduledDate: dateStr,
        hasArtwork: aiImageService.hasExistingArtwork(planet.id),
        artworkUrl: `/assets/planets/${planet.id}.jpg`,
        planet: {
          ...planet,
          issueNumber: issueNum,
          cryptoCertificate: certificate
        }
      });

      // Se a arte não existe ou forceRegenerate for solicitado, agenda para geração
      if (!aiImageService.hasExistingArtwork(planet.id) || forceRegenerate) {
        planetsNeedingArtwork.push(planet);
      }
    }

    console.log(`✅ [CICLO SEMANAL] Grade de 7 planetas travada no banco com sucesso.`);

    // Dispara a geração de imagens se a API de IA estiver configurada
    let generationResults = [];
    if (planetsNeedingArtwork.length > 0) {
      if (aiImageService.isConfigured()) {
        console.log(`🚀 [CICLO SEMANAL] Iniciando fila de geração de ${planetsNeedingArtwork.length} artes via IA...`);
        generationResults = await aiImageService.generateBatch(planetsNeedingArtwork, {
          delayMs: 10000,
          overwrite: forceRegenerate,
          onProgress
        });
      } else {
        console.warn('⚠️ [CICLO SEMANAL] Chaves de IA de imagem não configuradas. As artes ficarão disponíveis para o curador gerar no Gemini Web ou Together AI.');
      }
    } else {
      console.log('🎨 [CICLO SEMANAL] Todas as artes agendadas já existem em disco.');
    }

    return {
      success: true,
      scheduledWeek,
      generatedCount: generationResults.filter(r => r.success && !r.alreadyExisted).length,
      generationResults
    };
  },

  /**
   * Obtém a grade de curadoria completa para o Painel do Autor.
   * Lista todos os exoplanetas agendados no banco de dados com seus metadados,
   * permitindo ao autor inspecionar as Issues da primeira semana e as próximas semanas.
   */
  async getCuradoriaSchedule() {
    const allRecords = await planetRepository.getAllRecords();
    const schedule = [];

    // Se o banco estiver vazio, aciona o seed inicial
    if (allRecords.length === 0) {
      await planetRepository.seedDefaultPlanets();
      return this.getCuradoriaSchedule();
    }

    for (let i = 0; i < allRecords.length; i++) {
      const record = allRecords[i];
      let planet = this.getPlanetById(record.planet_id);

      if (!planet) {
        planet = EXOPLANETS_CATALOG[i % EXOPLANETS_CATALOG.length];
      }

      // Calcula o dia da semana a partir da data de publicação
      const [year, month, day] = record.published_date.split('-').map(Number);
      const dayDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      const dayIndex = (dayDate.getUTCDay() + 6) % 7; // 1 (Segunda) -> 0, ..., 0 (Domingo) -> 6
      const dayName = DAYS_OF_WEEK[dayIndex] || 'Data Oficial';

      const issueNum = record.id;
      const hasImg = aiImageService.hasExistingArtwork(planet.id);
      const masterPrompt = HOMOLOGATED_PROMPTS_GEMINI[planet.id] || buildPlanetPrompt(planet, 'gemini');
      const certificate = cryptoService.generateCertificate(planet.id, record.published_date);

      schedule.push({
        issueNumber: issueNum,
        issueLabel: `ISSUE #${String(issueNum).padStart(3, '0')}`,
        dayName,
        scheduledDate: record.published_date,
        hasArtwork: hasImg,
        artworkUrl: `/assets/planets/${planet.id}.jpg`,
        prompt: masterPrompt,
        cryptoCertificate: certificate,
        planet: {
          ...planet,
          issueNumber: issueNum,
          bannerOrientation: record.banner_orientation || planet.bannerOrientation || 'vertical',
          cryptoCertificate: certificate
        }
      });
    }

    return schedule;
  },

  /**
   * Regenera a arte de um planeta específico sob demanda no painel de curadoria
   */
  async regeneratePlanetArtwork(planetId) {
    const planet = this.getPlanetById(planetId);
    if (!planet) {
      throw new Error(`Exoplaneta "${planetId}" não encontrado no catálogo.`);
    }

    return await aiImageService.generateForPlanet(planet, { overwrite: true });
  },

  /**
   * Obtém o exoplaneta do dia atual ou realiza a publicação automática do próximo planeta inédito
   * @param {object} [options]
   * @param {string} [options.customDateStr]
   * @param {boolean} [options.isPreview]
   * @param {boolean} [options.isCurator]
   * @returns {Promise<object>}
   */
  async getDailyPlanet({ customDateStr = null, isPreview = false, isCurator = false, planetId = null, issueNum = null } = {}) {
    if (config.comingSoon && !isPreview) {
      return {
        success: true,
        comingSoon: true,
        launchDate: config.launchDate,
        message: 'Primeiro Drop Oficial em Breve! Sintonização telemetrica em andamento.',
        serverTimestamp: new Date().toISOString()
      };
    }

    let today = customDateStr || this.getTodayDateString();
    // Se a data atual for anterior à data de estreia oficial, no modo de prévia visualiza o drop de lançamento (Issue #001)
    if (!customDateStr && today < (config.launchDate || '2026-09-28')) {
      today = config.launchDate || '2026-09-28';
    }

    // Se um planeta específico for solicitado (ex: no modo prévia ou navegação da coleção)
    if (planetId || issueNum) {
      let chosenPlanet = null;
      let targetIssueNumber = null;

      if (planetId) {
        chosenPlanet = this.getPlanetById(planetId);
        const record = await planetRepository.getByDate(today);
        if (record && record.planet_id === planetId) {
          targetIssueNumber = record.id;
        } else {
          const all = await planetRepository.getAllRecords();
          const match = all.find(r => r.planet_id === planetId);
          targetIssueNumber = match ? match.id : (EXOPLANETS_CATALOG.findIndex(p => p.id === planetId) + 1 || 1);
        }
      } else if (issueNum) {
        const all = await planetRepository.getAllRecords();
        const match = all.find(r => r.id === issueNum);
        if (match) {
          chosenPlanet = this.getPlanetById(match.planet_id);
          targetIssueNumber = match.id;
        } else {
          const idx = (issueNum - 1) % EXOPLANETS_CATALOG.length;
          chosenPlanet = EXOPLANETS_CATALOG[idx];
          targetIssueNumber = issueNum;
        }
      }

      if (chosenPlanet) {
        // HARDENING DE SEGURANÇA (CWE-200 / Information Disclosure):
        // Usuários públicos só podem navegar em planetas já oficialmente liberados pelo calendário.
        // Apenas o curador autenticado ou preview autorizado tem acesso a edições futuras.
        if (!isCurator) {
          const all = await planetRepository.getAllRecords();
          const match = all.find(r => r.planet_id === chosenPlanet.id);
          const realTodayBrt = this.getTodayDateString();
          if (match && match.published_date > realTodayBrt) {
            return {
              success: false,
              forbidden: true,
              error: 'Edição confidencial. Este exoplaneta ainda não foi transmitido no catálogo público.'
            };
          }
        }

        const certificate = cryptoService.generateCertificate(chosenPlanet.id, today);
        return {
          success: true,
          publishedDate: today,
          planet: chosenPlanet,
          issueNumber: targetIssueNumber,
          bannerOrientation: chosenPlanet.bannerOrientation || 'vertical',
          cryptoCertificate: certificate,
          hasSavedBanner: false,
          serverTimestamp: new Date().toISOString()
        };
      }
    }

    // 1. Verifica se já existe um planeta agendado/publicado para a data
    let publishedRecord = await planetRepository.getByDate(today);
    let chosenPlanet = null;

    if (publishedRecord) {
      chosenPlanet = this.getPlanetById(publishedRecord.planet_id);
    }

    // 2. Se ainda não publicado para esta data, seleciona o próximo planeta inédito (resiliente)
    if (!chosenPlanet) {
      const publishedIds = await planetRepository.getAllPublishedIds();
      let availablePlanets = EXOPLANETS_CATALOG.filter(p => !publishedIds.includes(p.id));

      if (availablePlanets.length === 0) {
        // Se esgotaram os locais, busca da NASA
        const nasaPlanets = await nasaService.fetchExtremePlanets(1, publishedIds);
        if (nasaPlanets.length > 0) {
          chosenPlanet = nasaPlanets[0];
        } else {
          chosenPlanet = EXOPLANETS_CATALOG[0];
        }
      } else {
        chosenPlanet = availablePlanets[0];
      }

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
   */
  async saveBanner(dateStr, bannerDataUrl) {
    const targetDate = dateStr || this.getTodayDateString();
    return await planetRepository.updateBanner(targetDate, bannerDataUrl);
  },

  /**
   * Obtém métricas estatísticas da base de dados e do catálogo
   */
  async getStats() {
    const totalPublished = await planetRepository.count();
    return {
      totalCatalogPlanets: EXOPLANETS_CATALOG.length,
      publishedPlanetsCount: totalPublished,
      aiImageConfigured: aiImageService.isConfigured()
    };
  }
};
