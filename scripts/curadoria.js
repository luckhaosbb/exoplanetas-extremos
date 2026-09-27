import { exec } from 'child_process';
import http from 'http';
import { authService } from '../server/services/authService.js';
import { config } from '../server/config/index.js';

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      res.resume();
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.abort();
      resolve(false);
    });
  });
}

function openBrowser(url) {
  const startCmd = process.platform === 'win32' ? 'start ""' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} "${url}"`);
}

async function main() {
  console.log('\n======================================================');
  console.log('🛰️  OBSERVATÓRIO DE EXOPLANETAS • ACESSO DO CURADOR');
  console.log('======================================================\n');

  const isRemote = process.argv.includes('--remote') || process.argv.includes('-r');
  const token = authService.generateCuratorToken();

  let targetUrl = '';

  if (isRemote) {
    targetUrl = `https://exoplanets.luckhaosbb.dev/?curator_auth=${token}`;
    console.log('🌐 Conectando ao Observatório Oficial em Produção...');
  } else {
    const viteRunning = await isPortOpen(5173);
    const serverRunning = await isPortOpen(config.port || 3001);

    if (viteRunning) {
      targetUrl = `http://localhost:5173/?curator_auth=${token}`;
    } else if (serverRunning) {
      targetUrl = `http://localhost:${config.port || 3001}/?curator_auth=${token}`;
    } else {
      console.log('⚠️  Nenhum servidor local detectado rodando nas portas 5173 ou 3001.');
      console.log('💡 Dica: Certifique-se de que o servidor está rodando com: npm run dev\n');
      targetUrl = `http://localhost:5173/?curator_auth=${token}`;
    }
    console.log('💻 Conectando ao Observatório Local...');
  }

  console.log(`🔐 Token de sessão emitido (validade: 24 horas).`);
  console.log(`🚀 Abrindo seu navegador em:\n   ${targetUrl}\n`);

  openBrowser(targetUrl);
  console.log('✅ Painel pronto para inspeção semanal e geração de pôsteres!\n');
}

main().catch(console.error);
