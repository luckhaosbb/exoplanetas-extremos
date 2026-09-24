import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  serverSecretKey: process.env.SERVER_SECRET_KEY || 'EXO_COSMIC_ARCHIVE_PRIVATE_KEY_LUCAS_2026',
  databaseUrl: process.env.DATABASE_URL || null,
  isProduction: process.env.NODE_ENV === 'production',
  // Modo de pré-estreia (Em Breve) ativado por padrão até o usuário definir COMING_SOON=false
  comingSoon: process.env.COMING_SOON !== 'false',
  launchDate: process.env.LAUNCH_DATE || '2026-09-25'
};
