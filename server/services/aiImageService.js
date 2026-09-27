import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';
import { buildPlanetPrompt } from '../data/prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_ASSETS_DIR = path.resolve(__dirname, '..', 'assets', 'planets');
const PUBLIC_ASSETS_DIR = path.resolve(__dirname, '..', '..', 'public', 'assets', 'planets');
const DIST_ASSETS_DIR = path.resolve(__dirname, '..', '..', 'dist', 'assets', 'planets');

// Garante a existência dos diretórios de saída
[SERVER_ASSETS_DIR, PUBLIC_ASSETS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validação rigorosa contra Path Traversal (CWE-22)
 * Garante que o ID contenha exclusivamente caracteres seguros.
 */
function isValidPlanetId(planetId) {
  return typeof planetId === 'string' && /^[a-zA-Z0-9_-]{2,64}$/.test(planetId);
}

export const aiImageService = {
  /**
   * Verifica se o arquivo de imagem do planeta já existe em disco
   */
  hasExistingArtwork(planetId) {
    if (!isValidPlanetId(planetId)) return false;
    const serverPath = path.join(SERVER_ASSETS_DIR, `${planetId}.jpg`);
    return fs.existsSync(serverPath);
  },

  /**
   * Verifica se há ao menos uma rota de IA de geração de imagem habilitada e configurada
   */
  isConfigured() {
    return Boolean(
      config.siliconflowApiKey ||
      config.togetherApiKey ||
      (config.cloudflareEnabled && config.cloudflareAccountId && config.cloudflareApiToken) ||
      config.googleGenAiApiKey
    );
  },

  /**
   * 🇨🇳 ROTA 1: API SiliconFlow (SiliconCloud)
   * Modelo: black-forest-labs/FLUX.1-schnell (Endpoint Internacional / Doméstico)
   */
  async callSiliconFlowApi(prompt, isHorizontal = false, retries = 1) {
    const apiKey = config.siliconflowApiKey;
    if (!apiKey) {
      throw new Error('SILICONFLOW_API_KEY não configurada no servidor (.env).');
    }

    const model = config.siliconflowModel || 'black-forest-labs/FLUX.1-schnell';
    const imageSize = isHorizontal ? '1024x768' : '768x1024';
    const endpoint = 'https://api.siliconflow.com/v1/images/generations';

    const payload = {
      model,
      prompt,
      image_size: imageSize,
      batch_size: 1,
      num_inference_steps: 4
    };

    let attempt = 0;
    while (attempt <= retries) {
      try {
        attempt++;
        console.log(`🇨🇳 [ROTA 1: SiliconFlow] Solicitando arte (${imageSize})...`);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message || errData.error || `HTTP ${res.status}`;
          const isFatal = res.status === 401 || res.status === 402;
          if (isFatal) {
            throw new Error(`SiliconFlow HTTP ${res.status} (Fatal): ${errMsg}`);
          }
          throw new Error(`SiliconFlow HTTP ${res.status}: ${errMsg}`);
        }

        const data = await res.json();
        const imageUrl = data.images?.[0]?.url;

        if (!imageUrl) {
          throw new Error('SiliconFlow respondeu sem URL de imagem válida.');
        }

        console.log(`⬇️ [ROTA 1: SiliconFlow] Baixando imagem gerada...`);
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error(`Falha ao baixar imagem do SiliconFlow: HTTP ${imgRes.status}`);

        const arrayBuffer = await imgRes.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } catch (err) {
        if (err.message.includes('(Fatal)') || attempt > retries) throw err;
        console.warn(`⚠️ [ROTA 1: SiliconFlow] Erro: ${err.message}. Retentando...`);
        await sleep(3000);
      }
    }
  },

  /**
   * ⚡ ROTA 2: Together AI (FLUX.1.1-pro / FLUX.1-dev)
   * Modelo: black-forest-labs/FLUX.1.1-pro
   * Cota: $5.00 dólares gratuitos ao se cadastrar
   * Formato: Resolução nativa vertical 768x1024 e horizontal 1024x768
   */
  async callTogetherAiApi(prompt, isHorizontal = false, retries = 1) {
    if (!config.togetherApiKey) {
      throw new Error('TOGETHER_API_KEY não configurada no servidor (.env).');
    }

    const model = config.togetherModel || 'black-forest-labs/FLUX.1.1-pro';
    const width = isHorizontal ? 1024 : 768;
    const height = isHorizontal ? 768 : 1024;
    const endpoint = 'https://api.together.xyz/v1/images/generations';

    const payload = {
      model,
      prompt,
      width,
      height,
      steps: 4,
      n: 1,
      response_format: 'b64_json'
    };

    let attempt = 0;
    while (attempt <= retries) {
      try {
        attempt++;
        console.log(`⚡ [ROTA 2: Together AI] Solicitando FLUX.1 (${width}x${height})...`);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.togetherApiKey.trim()}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          let errMsg = errData.error?.message || errData.message || `HTTP ${res.status}`;
          if (res.status === 403 && errMsg.toLowerCase().includes('third-party')) {
            errMsg = `Ative o toggle "Allow passthrough models" em api.together.ai/settings/organization/privacy para autorizar os modelos FLUX.`;
          }
          const isFatal = res.status === 401 || res.status === 402 || res.status === 403 || res.status === 400;
          if (isFatal) {
            throw new Error(`Together AI HTTP ${res.status} (Fatal): ${errMsg}`);
          }
          throw new Error(`Together AI HTTP ${res.status}: ${errMsg}`);
        }

        const data = await res.json();
        const b64 = data.data?.[0]?.b64_json;
        if (b64) {
          return Buffer.from(b64, 'base64');
        }

        const url = data.data?.[0]?.url;
        if (url) {
          console.log(`⬇️ [ROTA 2: Together AI] Baixando arte gerada...`);
          const imgRes = await fetch(url);
          if (!imgRes.ok) throw new Error(`Falha ao baixar imagem do Together AI: HTTP ${imgRes.status}`);
          const arrayBuffer = await imgRes.arrayBuffer();
          return Buffer.from(arrayBuffer);
        }

        throw new Error('Together AI respondeu sem dados de imagem válidos.');
      } catch (err) {
        if (err.message.includes('(Fatal)') || attempt > retries) throw err;
        console.warn(`⚠️ [ROTA 2: Together AI] Erro: ${err.message}. Retentando...`);
        await sleep(3000);
      }
    }
  },




  /**
   * 🔷 ROTA 5: Google Cloud / Google AI Studio (Imagen 3 / Gemini)
   * Modelo: imagen-3.0-generate-002
   * Formato: Resolução e proporção A4 nativa (2:3 e 3:2), tipografia 3D e relevo Jack Kirby de qualidade máxima.
   */
  async callGoogleImagenApi(prompt, isHorizontal = false, retries = 1) {
    if (!config.googleGenAiApiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY não configurada no servidor (.env).');
    }

    const apiKey = encodeURIComponent(config.googleGenAiApiKey.trim());
    const aspectRatio = isHorizontal ? '4:3' : '3:4';

    let attempt = 0;
    while (attempt <= retries) {
      try {
        attempt++;
        console.log(`🔷 [ROTA 5: Google AI Studio] Solicitando arte (${aspectRatio})...`);

        // Tentativa 1: Endpoint Imagen 3 predict
        const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        const imagenPayload = {
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio,
            outputOptions: { mimeType: 'image/jpeg' }
          }
        };

        const res = await fetch(imagenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(imagenPayload)
        });

        if (res.ok) {
          const data = await res.json();
          const base64Data = data.predictions?.[0]?.bytesBase64Encoded || data.predictions?.[0]?.image?.imageBytes;
          if (base64Data) {
            return Buffer.from(base64Data, 'base64');
          }
        }

        // Tentativa 2: Endpoint Gemini Flash Image (Nano Banana) via generateContent
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
        const geminiPayload = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE']
          }
        };

        const geminiRes = await fetch(geminiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload)
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const part = geminiData.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
          if (part?.inlineData?.data) {
            return Buffer.from(part.inlineData.data, 'base64');
          }
        }

        const errData = await geminiRes.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${geminiRes.status || res.status}`;
        throw new Error(`Google AI Studio: ${errMsg}`);
      } catch (err) {
        if (attempt > retries) throw err;
        console.warn(`⚠️ [ROTA 5: Google AI Studio] Erro: ${err.message}. Retentando...`);
        await sleep(4000);
      }
    }
  },

  /**
   * Salva a imagem em buffer nas pastas necessárias do projeto
   */
  saveArtworkBuffer(planetId, imageBuffer) {
    if (!isValidPlanetId(planetId)) {
      throw new Error(`ID de exoplaneta inválido: "${planetId}"`);
    }

    const fileName = `${planetId}.jpg`;
    const targetDirs = [SERVER_ASSETS_DIR, PUBLIC_ASSETS_DIR];

    if (fs.existsSync(DIST_ASSETS_DIR)) {
      targetDirs.push(DIST_ASSETS_DIR);
    }

    targetDirs.forEach((dir) => {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, imageBuffer);
      } catch (err) {
        console.error(`❌ [AI IMAGE SERVICE] Erro ao gravar imagem em ${dir}:`, err.message);
      }
    });

    console.log(`✅ [AI IMAGE SERVICE] Arte do exoplaneta "${planetId}" gravada com sucesso nas pastas de assets.`);
    return `/assets/planets/${fileName}`;
  },

  /**
   * ⚡ ROTA 2: Cloudflare Workers AI
   * Modelo: @cf/black-forest-labs/flux-1-schnell
   * Cota: 10.000 Neurons/dia gratuitos (sempre disponível para contas gratuitas)
   */
  async callCloudflareWorkersAi(prompt, isHorizontal = false, retries = 1) {
    const accountId = config.cloudflareAccountId;
    const apiToken = config.cloudflareApiToken;
    if (!accountId || !apiToken) {
      throw new Error('CLOUDFLARE_ACCOUNT_ID ou CLOUDFLARE_API_TOKEN não configurados no servidor (.env).');
    }

    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const payload = {
      prompt,
      steps: 4
    };

    let attempt = 0;
    while (attempt <= retries) {
      try {
        attempt++;
        console.log(`⚡ [ROTA 2: Cloudflare Workers AI] Solicitando FLUX.1-schnell...`);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken.trim()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`Cloudflare Workers AI HTTP ${res.status}: ${errText.slice(0, 150)}`);
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (json.result?.image) {
            return Buffer.from(json.result.image, 'base64');
          }
          throw new Error('Cloudflare respondeu JSON sem imagem válida.');
        }

        const arrayBuffer = await res.arrayBuffer();
        if (arrayBuffer.byteLength < 5000) {
          throw new Error('Cloudflare respondeu com payload de imagem vazio ou corrompido.');
        }

        return Buffer.from(arrayBuffer);
      } catch (err) {
        if (attempt > retries) throw err;
        console.warn(`⚠️ [ROTA 2: Cloudflare Workers AI] Erro: ${err.message}. Retentando...`);
        await sleep(4000);
      }
    }
  },

  /**
   * Executa a Cascata de Resiliência (Cascade Fallback Chain):
   * Tenta sucessivamente:
   * 1. SiliconFlow (se configurado)
   * 2. Together AI ($5.00 Gratuitos - FLUX.1-schnell nativo 768x1024)
   * 3. Cloudflare Workers AI (se configurado e habilitado)
   * 4. Google Cloud / Google AI Studio (Imagen 3 / Gemini Image - Padrão Ouro)
   */
  async generateArtworkWithCascade(planet) {
    const isHorizontal = planet.bannerOrientation === 'horizontal';
    const errors = [];

    // ROTA 1 (PRINCIPAL): Together AI (FLUX.1.1-pro nativo 768x1024 / 1024x768)
    if (config.togetherApiKey) {
      try {
        const prompt = buildPlanetPrompt(planet, 'together');
        const buffer = await this.callTogetherAiApi(prompt, isHorizontal);
        return { buffer, provider: 'together' };
      } catch (err) {
        console.warn(`⚠️ [CASCADE] Rota Principal (Together AI) falhou: ${err.message}. Verificando fallback...`);
        errors.push({ provider: 'together', error: err.message });
      }
    }

    // ROTA 2 (FALLBACK): Cloudflare Workers AI (ativável via CLOUDFLARE_ENABLED=true)
    if (config.cloudflareEnabled && config.cloudflareAccountId && config.cloudflareApiToken) {
      try {
        const prompt = buildPlanetPrompt(planet, 'cloudflare');
        const buffer = await this.callCloudflareWorkersAi(prompt, isHorizontal);
        return { buffer, provider: 'cloudflare' };
      } catch (err) {
        console.warn(`⚠️ [CASCADE] Rota Fallback (Cloudflare Workers AI) falhou: ${err.message}.`);
        errors.push({ provider: 'cloudflare', error: err.message });
      }
    }

    console.error(`❌ [CASCADE] Todas as rotas ativas falharam para "${planet.name}".`);
    throw new Error(`Todas as rotas ativas da cascata falharam para "${planet.name}": ${errors.map(e => `${e.provider}: ${e.error}`).join(' | ')}`);
  },

  /**
   * Gera a arte para um exoplaneta individual utilizando a Cascata de Resiliência
   */
  async generateForPlanet(planet, { overwrite = false } = {}) {
    if (!isValidPlanetId(planet.id)) {
      throw new Error(`Identificador de planeta inválido: ${planet.id}`);
    }

    if (!overwrite && this.hasExistingArtwork(planet.id)) {
      console.log(`ℹ️ [AI IMAGE SERVICE] Arte de "${planet.name}" já existe em disco. Ignorando geração.`);
      return {
        success: true,
        alreadyExisted: true,
        artworkUrl: `/assets/planets/${planet.id}.jpg`
      };
    }

    console.log(`🎨 [AI IMAGE SERVICE] Iniciando geração para "${planet.name}" via Cascata de Resiliência...`);
    const { buffer, provider } = await this.generateArtworkWithCascade(planet);
    const url = this.saveArtworkBuffer(planet.id, buffer);

    return {
      success: true,
      alreadyExisted: false,
      provider,
      artworkUrl: url
    };
  },

  /**
   * Gera em lote para uma lista de exoplanetas sequencialmente com delay de segurança
   */
  async generateBatch(planets, { delayMs = 6000, overwrite = false, onProgress = null } = {}) {
    const results = [];

    for (let i = 0; i < planets.length; i++) {
      const planet = planets[i];
      try {
        if (typeof onProgress === 'function') {
          onProgress({ index: i + 1, total: planets.length, planetName: planet.name });
        }

        const res = await this.generateForPlanet(planet, { overwrite });
        results.push({ planetId: planet.id, ...res });

        if (!res.alreadyExisted && i < planets.length - 1) {
          console.log(`⏳ [AI IMAGE SERVICE] Delay de segurança: aguardando ${delayMs / 1000}s para o próximo planeta...`);
          await sleep(delayMs);
        }
      } catch (err) {
        console.error(`❌ [AI IMAGE SERVICE] Falha ao processar arte de "${planet.name}":`, err.message);
        results.push({ planetId: planet.id, success: false, error: err.message });
      }
    }

    return results;
  }
};
