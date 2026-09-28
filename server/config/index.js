import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  serverSecretKey: process.env.SERVER_SECRET_KEY || 'EXO_COSMIC_ARCHIVE_PRIVATE_KEY_LUCAS_2026',
  databaseUrl: process.env.DATABASE_URL || null,
  isProduction: process.env.NODE_ENV === 'production',
  timeZone: 'America/Sao_Paulo',
  launchDate: process.env.LAUNCH_DATE || '2026-09-28',
  
  // Modo de pré-estreia (Em Breve):
  // Se explicitamente definido no .env como 'false' ou 'true', respeita a variável.
  // Caso contrário, calcula dinamicamente com base no horário oficial de Brasília (America/Sao_Paulo):
  // ativa 'comingSoon' enquanto agora < 28/09/2026 00:00:00 BRT, e vira automaticamente para oficial.
  get comingSoon() {
    if (process.env.COMING_SOON === 'false') return false;
    if (process.env.COMING_SOON === 'true') return true;
    
    try {
      const nowInBrasilia = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const [y, m, d] = (this.launchDate || '2026-09-28').split('-').map(Number);
      const launchInBrasilia = new Date(y, m - 1, d, 0, 0, 0);
      return nowInBrasilia < launchInBrasilia;
    } catch {
      return process.env.COMING_SOON !== 'false';
    }
  },

  // Senha/Chave secreta de autenticação do Painel do Autor / Curadoria
  curadoriaPassword: process.env.CURADORIA_PASSWORD || process.env.CURADORIA_SECRET || 'obs_k7x9m2_luckhaos',
  curadoriaSecret: process.env.CURADORIA_SECRET || process.env.CURADORIA_PASSWORD || 'obs_k7x9m2_luckhaos',
  // ROTA 1: SiliconFlow / SiliconCloud (FLUX.1-schnell via GPU Cluster)
  siliconflowApiKey: process.env.SILICONFLOW_API_KEY || null,
  siliconflowModel: process.env.SILICONFLOW_MODEL || 'black-forest-labs/FLUX.1-schnell',
  // ROTA 2: Together AI (FLUX.1.1-pro nativo 768x1024)
  togetherApiKey: process.env.TOGETHER_API_KEY || null,
  togetherModel: process.env.TOGETHER_MODEL || 'black-forest-labs/FLUX.1.1-pro',
  // ROTA 3: Cloudflare Workers AI (ativável via CLOUDFLARE_ENABLED=true)
  cloudflareEnabled: process.env.CLOUDFLARE_ENABLED === 'true',
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID || null,
  cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN || null,
  // ROTA MANUAL: Google Gemini Pro Web (Padrão Ouro das Issues #001 a #005 via Curadoria)
  googleGenAiApiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY || null,
  aiImageModel: process.env.AI_IMAGE_MODEL || 'imagen-3.0-generate-002',

  // Provedor Transacional de E-mails (Resend)
  resendApiKey: process.env.RESEND_API_KEY || null,
  emailFrom: process.env.EMAIL_FROM || 'Lucas Gomes • Exoplanetas Extremos <alertas@luckhaosbb.dev>',
  appBaseUrl: process.env.APP_BASE_URL || 'https://exoplanets.luckhaosbb.dev'
};

