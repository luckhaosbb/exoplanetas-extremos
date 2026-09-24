import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { initDatabase } from './repositories/database.js';
import apiRouter from './routes/api.js';

const app = express();

// Middlewares essenciais
app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Montagem das Rotas da API
app.use('/api', apiRouter);

// Servir frontend compilado (SPA) em produção ou se o build dist/ existir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(__dirname, '..', 'dist');

if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
    next();
  });
}

// Inicialização e Bootstrap da Aplicação
async function bootstrap() {
  try {
    await initDatabase();
    app.listen(config.port, () => {
      console.log(`🌌 Servidor de Exoplanetas Extremos rodando na porta ${config.port} (${config.nodeEnv})`);
      console.log(`📡 API Pronta: http://localhost:${config.port}/api/today`);
    });
  } catch (error) {
    console.error('❌ Falha fatal ao inicializar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();
