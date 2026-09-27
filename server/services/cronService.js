import cron from 'node-cron';
import { planetService } from './planetService.js';

let weeklyTask = null;

export const cronService = {
  /**
   * Inicializa os agendadores em background do sistema
   */
  startCronJobs() {
    // Agenda para rodar todo SÁBADO às 00:00:00 no Horário Oficial de Brasília (UTC-3)
    // Sintaxe cron: segundo minuto hora dia-do-mês mês dia-da-semana (0-6, onde 6 = Sábado)
    const scheduleExpr = '0 0 * * 6';

    weeklyTask = cron.schedule(scheduleExpr, async () => {
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

    console.log('⏰ [CRON SERVICE] Agendador ativo: Execução programada para todo SÁBADO às 00:00 (Horário de Brasília).');
  },

  /**
   * Encerra os agendadores de forma limpa (Graceful Shutdown)
   */
  stopCronJobs() {
    if (weeklyTask) {
      weeklyTask.stop();
      console.log('🛑 [CRON SERVICE] Agendadores cron finalizados.');
    }
  }
};
