import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  serverSecretKey: process.env.SERVER_SECRET_KEY || 'EXO_COSMIC_ARCHIVE_PRIVATE_KEY_LUCAS_2026',
  databaseUrl: process.env.DATABASE_URL || null,
  isProduction: process.env.NODE_ENV === 'production'
};
