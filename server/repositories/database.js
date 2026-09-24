import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

export const LOCAL_DB_PATH = path.join(DATA_DIR, 'published_planets.json');
export const SUBSCRIBERS_PATH = path.join(DATA_DIR, 'subscribers.json');

// Garante a existência do diretório de dados e arquivos locais
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(SUBSCRIBERS_PATH)) {
  fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify([], null, 2), 'utf-8');
}

let pool = null;
let isPostgresActive = false;

export async function initDatabase() {
  if (config.databaseUrl) {
    try {
      pool = new pg.Pool({
        connectionString: config.databaseUrl,
        ssl: config.isProduction ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 3000
      });

      const client = await pool.connect();
      
      // Criação idempotente de tabelas
      await client.query(`
        CREATE TABLE IF NOT EXISTS published_planets (
          id SERIAL PRIMARY KEY,
          planet_id VARCHAR(100) NOT NULL UNIQUE,
          planet_name VARCHAR(150) NOT NULL,
          published_date VARCHAR(10) NOT NULL UNIQUE,
          banner_orientation VARCHAR(20) NOT NULL DEFAULT 'vertical',
          banner_data TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS subscribers (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      client.release();
      isPostgresActive = true;
      console.log('🐘 [DATABASE] Conexão com PostgreSQL estabelecida com sucesso.');
      return { type: 'postgres', pool };
    } catch (err) {
      console.warn('⚠️ [DATABASE] Falha ao conectar ao PostgreSQL:', err.message);
      console.log('📁 [DATABASE] Ativando fallback local JSON persistente.');
      isPostgresActive = false;
      pool = null;
    }
  } else {
    console.log('📁 [DATABASE] DATABASE_URL não definida. Usando banco de dados local JSON persistente.');
  }

  return { type: 'json' };
}

export function getPool() {
  return pool;
}

export function isPostgres() {
  return isPostgresActive && pool !== null;
}
