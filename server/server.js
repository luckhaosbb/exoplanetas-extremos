import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { initDatabase } from './repositories/database.js';
import { planetRepository } from './repositories/planetRepository.js';
import { authService } from './services/authService.js';
import { cronService } from './services/cronService.js';
import { planetService } from './services/planetService.js';
import apiRouter from './routes/api.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(__dirname, '..', 'dist');
const PLANETS_ASSETS_PATH = path.join(__dirname, 'assets', 'planets');

// Middlewares essenciais e Cabeçalhos de Segurança (Hardening)
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Rate Limiter em memória para Inscrição na Newsletter (mitigação de flood/spam)
const subscribeRateLimit = new Map();
app.use('/api/subscribe', (req, res, next) => {
  if (req.method !== 'POST') return next();
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const record = subscribeRateLimit.get(clientIp) || { count: 0, resetAt: now + 10 * 60 * 1000 };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + 10 * 60 * 1000;
  }

  record.count += 1;
  subscribeRateLimit.set(clientIp, record);

  if (record.count > 10) {
    return res.status(429).json({
      success: false,
      error: 'Muitas tentativas de inscrição a partir deste endereço. Tente novamente mais tarde.'
    });
  }
  next();
});

// Endpoint seguro para artes e pôsteres de planetas:
// NUNCA revela arte de planetas futuros ou em pré-estreia a usuários não autorizados
app.get('/assets/planets/:filename', async (req, res) => {
  const { filename } = req.params;
  const cleanFilename = path.basename(filename);
  const filePath = path.join(PLANETS_ASSETS_PATH, cleanFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Arte não encontrada no observatório.' });
  }

  const planetId = cleanFilename.replace(/\.(jpg|jpeg|png|webp)$/i, '');
  const isPreview = req.query.preview === 'true';
  const isCurator = authService.isRequestAuthenticated(req);
  const isLocal = !config.isProduction || req.hostname === 'localhost' || req.hostname === '127.0.0.1';

  // Curador autenticado, modo preview ou ambiente local/dev tem acesso irrestrito
  if (isCurator || isPreview || isLocal) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.sendFile(filePath);
  }

  // Em modo Coming Soon em produção pública externa, as artes são protegidas contra raspagem
  if (config.comingSoon) {
    return res.status(404).json({ error: 'Arte confidencial. Aguardando estreia oficial.' });
  }

  // Em produção liberada, verifica se este planeta já foi oficialmente liberado pelo calendário
  try {
    const todayBrt = planetService.getTodayDateString();
    const releasedIds = await planetRepository.getOfficiallyReleasedPlanetIds(todayBrt);
    if (releasedIds.includes(planetId)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(filePath);
    }
  } catch (err) {
    console.error('❌ Erro ao consultar publicação de arte:', err.message);
  }

  return res.status(404).json({ error: 'Arte ainda não liberada no catálogo público.' });
});

// Montagem das Rotas da API
app.use('/api', apiRouter);

// Servir frontend compilado (SPA) em produção ou se o build dist/ existir
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/assets/planets')) {
      return res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
    next();
  });
}

// Inicialização e Bootstrap da Aplicação
async function bootstrap() {
  try {
    await initDatabase();

    // Garante a existência dos 8 exoplanetas homologados no banco de dados
    await planetRepository.seedDefaultPlanets();

    app.listen(config.port, () => {
      console.log(`🌌 Servidor de Exoplanetas Extremos rodando na porta ${config.port} (${config.nodeEnv})`);
      console.log(`📡 API Pronta: http://localhost:${config.port}/api/today`);
      if (config.comingSoon) {
        console.log(`🔒 Modo 'Em Breve' ATIVO. O catálogo permanece bloqueado até o lançamento oficial.`);
      }

      // Inicia agendador cron semanal (todo sábado às 00:00)
      cronService.startCronJobs();
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 [SERVER] Recebido SIGTERM. Encerrando servidor e cron jobs...');
      cronService.stopCronJobs();
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('🛑 [SERVER] Recebido SIGINT. Encerrando servidor e cron jobs...');
      cronService.stopCronJobs();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Falha fatal ao inicializar o servidor:', error);
    process.exit(1);
  }
}

bootstrap();
