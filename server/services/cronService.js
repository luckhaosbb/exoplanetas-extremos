import cron from 'node-cron';
import { planetService } from './planetService.js';
import { subscriberRepository } from '../repositories/subscriberRepository.js';
import { emailService } from './emailService.js';

let weeklyTask = null;
let dailyDropTask = null;

export const cronService = {
  /**
   * Inicializa os agendadores em background do sistema
   */
  startCronJobs() {
    // 1. Ciclo Semanal: Roda todo SÁBADO às 00:00:00 no Horário de Brasília (UTC-3)
    const scheduleWeeklyExpr = '0 0 * * 6';

    weeklyTask = cron.schedule(scheduleWeeklyExpr, async () => {
      console.log('\n⏰ [CRON SERVICE] Disparo do ciclo semanal de SÁBADO (00:00 BRT)!');
      try {
        const result = await planetService.runWeeklyCurationCycle();
        console.log(`✅ [CRON SERVICE] Ciclo semanal concluído com sucesso. Planetas agendados: ${result.scheduledWeek?.length || 0}.`);
      } catch (err) {
        console.error('❌ [CRON SERVICE] Erro crítico ao executar o ciclo semanal de sábado:', err);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    // 2. Alerta Diário: Roda TODOS OS DIAS às 00:00:10 no Horário de Brasília (10s após a virada do drop)
    const scheduleDailyExpr = '10 0 * * *';

    dailyDropTask = cron.schedule(scheduleDailyExpr, async () => {
      console.log('\n⏰ [CRON SERVICE] Disparo do alerta diário de novo drop para assinantes (00:00:10 BRT)!');
      try {
        const todayData = await planetService.getTodayPlanet();
        if (todayData?.planet) {
          const subscribers = await subscriberRepository.getAll();
          if (subscribers && subscribers.length > 0) {
            if (emailService.isConfigured()) {
              await emailService.sendDailyDropAlert(subscribers, todayData.planet);
            } else {
              console.log(`ℹ️ [CRON SERVICE] ${subscribers.length} assinante(s) na fila, mas RESEND_API_KEY ainda não configurada no .env.`);
            }
          }
        }
      } catch (err) {
        console.error('❌ [CRON SERVICE] Erro ao disparar alerta diário aos inscritos:', err);
      }
    }, {
      timezone: 'America/Sao_Paulo'
    });

    console.log('⏰ [CRON SERVICE] Agendadores ativos: Ciclo semanal aos sábados (00:00) e Alertas diários aos inscritos (00:00 BRT).');
  },

  /**
   * Encerra os agendadores de forma limpa (Graceful Shutdown)
   */
  stopCronJobs() {
    if (weeklyTask) {
      weeklyTask.stop();
    }
    if (dailyDropTask) {
      dailyDropTask.stop();
    }
    console.log('🛑 [CRON SERVICE] Agendadores cron finalizados.');
  }
};
