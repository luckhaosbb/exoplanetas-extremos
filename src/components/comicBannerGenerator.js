// Motor Procedural de Geração de Banner/Pôster Estilo Comic Marvel (Proporção A4)
// Layout autoral, limpo e cinematográfico: sem poluição visual na arte.
// A Chave Criptográfica de Autenticidade (NFT-like Provenance) e os dados do planeta
// são injetados invisivelmente na estrutura binária dos METADADOS do arquivo PNG (chunks tEXt).

// Tabela CRC32 para cálculo de integridade dos chunks PNG
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function calculateCrc(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Cria um chunk PNG 'tEXt' oficial com chave e valor
function createPngTextChunk(keyword, text) {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(keyword);
  const textBytes = encoder.encode(text);
  const dataLen = keyBytes.length + 1 + textBytes.length;

  const chunk = new Uint8Array(12 + dataLen);
  const view = new DataView(chunk.buffer);

  // 4 bytes: Tamanho dos dados
  view.setUint32(0, dataLen);
  // 4 bytes: Tipo do chunk 'tEXt' (ASCII: 116, 69, 88, 116)
  chunk[4] = 0x74; chunk[5] = 0x45; chunk[6] = 0x58; chunk[7] = 0x74;

  // Dados: keyword + byte nulo 0x00 + text
  chunk.set(keyBytes, 8);
  chunk[8 + keyBytes.length] = 0;
  chunk.set(textBytes, 8 + keyBytes.length + 1);

  // 4 bytes: CRC32 calculado sobre tipo + dados
  const crcTarget = chunk.subarray(4, 8 + dataLen);
  const crc = calculateCrc(crcTarget);
  view.setUint32(8 + dataLen, crc);

  return chunk;
}

export class ComicBannerGenerator {
  constructor(planetData, orientation = 'vertical', cryptoCertificate = null) {
    this.planet = planetData;
    this.orientation = orientation || planetData.bannerOrientation || 'vertical';
    this.certificate = cryptoCertificate || planetData.cryptoCertificate || null;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Proporções exatas A4 para impressão e exibição ultra nítida (300 DPI)
    if (this.orientation === 'horizontal') {
      this.width = 3508;
      this.height = 2480;
    } else {
      this.width = 2480;
      this.height = 3508;
    }

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.issueNumber = planetData.issueNumber || 1;

    // Se o backend forneceu certificado assinado com HMAC-SHA256, usamos ele; senão geramos o fallback local
    this.cryptoToken = this.certificate?.tokenId || this.generateCryptoToken();
  }

  // Helper para carregar a arte base conceitual da Opção 3 (Master Concept Art)
  loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  // Renderiza a arte base cobrindo o canvas com proporção perfeita (cover)
  drawMasterArtwork(ctx, w, h, img) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let renderW, renderH, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      renderH = h;
      renderW = h * imgRatio;
      offsetX = (w - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = w;
      renderH = w / imgRatio;
      offsetX = 0;
      offsetY = (h - renderH) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  // Gera token hash criptográfico único para provar a autenticidade do drop (fallback offline)
  generateCryptoToken() {
    const raw = `${this.planet.id}-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).substring(2, 10)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash) + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const randomHex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
    return `TOKEN#EXO-${hex.slice(0, 4)}-${hex.slice(4)}-${randomHex}`;
  }

  // Injeta metadados criptográficos invisíveis diretamente na estrutura binária do PNG
  injectMetadataIntoPng(base64DataUrl) {
    const base64Parts = base64DataUrl.split(',');
    const binaryStr = atob(base64Parts[1]);
    const originalBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      originalBytes[i] = binaryStr.charCodeAt(i);
    }

    // Localiza o chunk final IEND (últimos 12 bytes do PNG válido)
    const iendIndex = originalBytes.length - 12;

    // Chunks de metadados NFT-like para provar a autenticidade
    const nowIso = new Date().toISOString();
    const metadataChunks = [
      createPngTextChunk('Exoplanet_ID', this.planet.id),
      createPngTextChunk('Exoplanet_Name', this.planet.name),
      createPngTextChunk('Title', this.planet.comicHeroTitle || 'THE COSMIC HORROR'),
      createPngTextChunk('Subtitle', this.planet.title || ''),
      createPngTextChunk('Drop_Date', this.certificate?.issuedAt ? this.certificate.issuedAt.slice(0, 10) : nowIso.slice(0, 10)),
      createPngTextChunk('NFT_Token_ID', this.cryptoToken),
      createPngTextChunk('HMAC_Signature', this.certificate?.signature || 'LOCAL_STANDALONE_BUILD'),
      createPngTextChunk('Serial_Entropy', this.certificate?.serial || 'LOCAL_ENTROPY'),
      createPngTextChunk('Authenticity', 'Certified Original Daily Drop - Exoplanetas Extremos'),
      createPngTextChunk('Verification_Endpoint', '/api/verify-token'),
      createPngTextChunk('Developer', 'Lucas Gomes (github.com/luckhaosbb)'),
      createPngTextChunk('Timestamp', nowIso)
    ];

    // Calcula o tamanho total dos novos chunks
    const totalExtraLength = metadataChunks.reduce((acc, c) => acc + c.length, 0);

    // Cria o novo buffer contendo os metadados invisíveis injetados antes do IEND
    const modifiedBytes = new Uint8Array(originalBytes.length + totalExtraLength);
    modifiedBytes.set(originalBytes.subarray(0, iendIndex), 0);

    let offset = iendIndex;
    for (const chunk of metadataChunks) {
      modifiedBytes.set(chunk, offset);
      offset += chunk.length;
    }

    // Copia o chunk de encerramento IEND
    modifiedBytes.set(originalBytes.subarray(iendIndex), offset);

    // Converte de volta para DataURL para download direto
    let newBinary = '';
    const chunkSize = 8192;
    for (let i = 0; i < modifiedBytes.length; i += chunkSize) {
      newBinary += String.fromCharCode.apply(null, modifiedBytes.subarray(i, i + chunkSize));
    }
    return `data:image/png;base64,${btoa(newBinary)}`;
  }

  // Gera a arte completa e retorna a DataURL em PNG com os metadados criptográficos embutidos
  async generatePoster() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const isHoriz = this.orientation === 'horizontal';
    const config = this.planet.visualConfig || {};

    // 1. Tenta carregar a arte base conceitual da Opção 3 (Master Concept Art)
    const masterArtSrc = this.planet.customArtworkUrl || `/assets/planets/${this.planet.id}.jpg`;
    const masterImg = await this.loadImage(masterArtSrc);

    if (masterImg) {
      // Desenha a arte base autoral pura ocupando o poster
      this.drawMasterArtwork(ctx, w, h, masterImg);
    } else {
      // Fallback autônomo procedural caso a arte física ainda não exista
      this.drawCosmicBackground(ctx, w, h, config);
      this.drawActionRays(ctx, w, h, isHoriz, config);
      this.drawPlanetIllustration(ctx, w, h, isHoriz, config);
    }

    // 2. Efeito de Meio-Tom / Retícula Ben-Day Dots
    this.drawHalftoneOverlay(ctx, w, h);

    // 3. Moldura de Quadrinhos Vintage & Borda Envelhecida
    this.drawVintageBorders(ctx, w, h);

    // 4. Selo Vintage "Approved by Cosmic Archive Authority" (Canto Superior Direito)
    this.drawComicsCodeSeal(ctx, w, h, isHoriz);

    // 5. Badge Retrô "ISSUE #001 - EXTREME WORLDS DAILY" sem preço (Canto Superior Esquerdo)
    this.drawIssueBox(ctx, w, h, isHoriz);

    // 6. Placa com o Nome Oficial do Exoplaneta (Canto Inferior Esquerdo - Estilo Comic)
    this.drawPlanetNamePlate(ctx, w, h, isHoriz);

    // 7. Título Comic Épico (desenhado apenas no fallback procedural, pois as artes conceituais já trazem o título integrado)
    if (!masterImg) {
      this.drawComicTitle(ctx, w, h, isHoriz);
    }

    // 7. Textura e Vinheta de Papel Vintage
    this.drawVintagePaperVignette(ctx, w, h);

    // Exporta imagem bruta e injeta a chave criptográfica nos metadados binários do PNG
    const rawDataUrl = this.canvas.toDataURL('image/png');
    return this.injectMetadataIntoPng(rawDataUrl);
  }

  // Fundo do espaço profundo
  drawCosmicBackground(ctx, w, h, config) {
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#060714');
    bgGrad.addColorStop(0.5, '#0b0820');
    bgGrad.addColorStop(1, '#020308');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Nebulosa com cores temáticas do planeta
    const nebulaGrad = ctx.createRadialGradient(
      w * 0.5, h * 0.5, 120,
      w * 0.5, h * 0.5, Math.max(w, h) * 0.65
    );
    nebulaGrad.addColorStop(0, config.glowColor ? config.glowColor.replace(/[\d\.]+\)$/, '0.4)') : 'rgba(255, 60, 0, 0.4)');
    nebulaGrad.addColorStop(0.6, 'rgba(25, 10, 45, 0.3)');
    nebulaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebulaGrad;
    ctx.fillRect(0, 0, w, h);

    // Estrelas de fundo
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 350; i++) {
      const sx = (Math.sin(i * 997) * 0.5 + 0.5) * w;
      const sy = (Math.cos(i * 613) * 0.5 + 0.5) * h;
      const size = (i % 6 === 0) ? 5 : 2.5;
      ctx.globalAlpha = 0.25 + (i % 7) * 0.1;
      ctx.fillRect(sx, sy, size, size);
    }
    ctx.globalAlpha = 1.0;
  }

  // Raios de ação dinâmicos clássicos de quadrinhos
  drawActionRays(ctx, w, h, isHoriz, config) {
    ctx.save();
    const cx = isHoriz ? w * 0.48 : w * 0.5;
    const cy = isHoriz ? h * 0.54 : h * 0.52;

    const numRays = 40;
    for (let i = 0; i < numRays; i++) {
      const angle = (i * Math.PI * 2) / numRays;
      const nextAngle = ((i + 0.35) * Math.PI * 2) / numRays;
      const r = Math.max(w, h) * 0.95;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
      ctx.lineTo(cx + Math.cos(nextAngle) * r, cy + Math.sin(nextAngle) * r);
      ctx.closePath();

      ctx.fillStyle = (i % 2 === 0) ? 'rgba(255, 255, 255, 0.035)' : (config.secondaryColor || '#ffaa00') + '0c';
      ctx.fill();
    }
    ctx.restore();
  }

  // Ilustração dramática do planeta com mais presença artística
  drawPlanetIllustration(ctx, w, h, isHoriz, config) {
    ctx.save();
    const cx = isHoriz ? w * 0.48 : w * 0.5;
    const cy = isHoriz ? h * 0.55 : h * 0.54;
    const radius = isHoriz ? h * 0.38 : w * 0.38;

    // Resplendor atmosférico
    const corona = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.6);
    corona.addColorStop(0, config.glowColor || 'rgba(0, 200, 255, 0.85)');
    corona.addColorStop(0.45, config.atmosphereColor || 'rgba(0, 150, 255, 0.35)');
    corona.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    // Contorno de tinta espesso estilo HQ (Comic Inking)
    ctx.beginPath();
    if (config.type === 'egg_devoured') {
      ctx.ellipse(cx, cy, radius * 1.35, radius * 0.85, 0.15, 0, Math.PI * 2);
    } else {
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    }
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#04060d';
    ctx.stroke();

    // Máscara da esfera do planeta
    ctx.save();
    ctx.clip();

    // Gradiente esférico dramático de alto contraste
    const lightX = cx - radius * 0.45;
    const lightY = cy - radius * 0.45;
    const sphereGrad = ctx.createRadialGradient(lightX, lightY, radius * 0.05, cx, cy, radius * 1.15);
    sphereGrad.addColorStop(0, '#ffffff');
    sphereGrad.addColorStop(0.18, config.secondaryColor || '#ffbb00');
    sphereGrad.addColorStop(0.55, config.primaryColor || '#ff3300');
    sphereGrad.addColorStop(1, '#020308');

    ctx.fillStyle = sphereGrad;
    ctx.fillRect(cx - radius * 1.6, cy - radius * 1.6, radius * 3.2, radius * 3.2);

    // Detalhes da superfície
    this.drawPlanetSurfaceArt(ctx, cx, cy, radius, config);

    // Sombra terminadora profunda estilo Graphic Novel
    const terminator = ctx.createRadialGradient(cx + radius * 0.38, cy + radius * 0.38, radius * 0.15, cx, cy, radius * 1.05);
    terminator.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
    terminator.addColorStop(0.55, 'rgba(4, 5, 12, 0.7)');
    terminator.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = terminator;
    ctx.fillRect(cx - radius * 1.6, cy - radius * 1.6, radius * 3.2, radius * 3.2);

    ctx.restore(); // Fim do clip

    // Partículas e efeitos violentos que extravasam a esfera
    this.drawComicParticles(ctx, cx, cy, radius, isHoriz, config);

    ctx.restore();
  }

  // Texturas de superfície estilizadas de quadrinhos
  drawPlanetSurfaceArt(ctx, cx, cy, radius, config) {
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    if (config.type === 'glass_storm') {
      // Vórtice e faixas de cisalhamento supersônico de vidro
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      for (let i = -4; i <= 4; i++) {
        ctx.beginPath();
        const y = cy + i * (radius * 0.22);
        ctx.ellipse(cx, y, radius * 0.96, radius * 0.12, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // O Grande Vórtice de Silicato
      const spotX = cx - radius * 0.15;
      const spotY = cy - radius * 0.25;
      const spotGrad = ctx.createRadialGradient(spotX, spotY, 10, spotX, spotY, radius * 0.28);
      spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      spotGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.7)');
      spotGrad.addColorStop(1, 'rgba(0, 80, 255, 0)');
      ctx.fillStyle = spotGrad;
      ctx.beginPath();
      ctx.ellipse(spotX, spotY, radius * 0.35, radius * 0.18, -0.1, 0, Math.PI * 2);
      ctx.fill();

    } else if (config.type === 'ultra_hot' || config.type === 'iron_rain' || config.type === 'diamond_lava') {
      // Fissuras de lava / magma e fogo
      ctx.strokeStyle = '#ffff55';
      ctx.lineWidth = 12;
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * radius * 0.1, cy + Math.sin(a) * radius * 0.1);
        ctx.lineTo(cx + Math.cos(a + 0.3) * radius * 0.55, cy + Math.sin(a + 0.3) * radius * 0.55);
        ctx.lineTo(cx + Math.cos(a + 0.1) * radius * 0.88, cy + Math.sin(a + 0.1) * radius * 0.88);
        ctx.stroke();
      }
    } else if (config.type === 'pulsar_radiation') {
      // Arcos elétricos e anéis de radiação
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 8;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * (i * 0.22), 0, Math.PI * 1.5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Partículas dramáticas estilo HQ
  drawComicParticles(ctx, cx, cy, radius, isHoriz, config) {
    ctx.save();
    if (config.type === 'glass_storm') {
      // Chuva horizontal de vidro estilhaçado a Mach 7
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 5;
      for (let i = 0; i < 110; i++) {
        const px = cx - radius * 1.3 + Math.random() * radius * 2.9;
        const py = cy - radius * 1.2 + Math.random() * radius * 2.4;
        const len = 70 + Math.random() * 110;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + len, py + (Math.random() - 0.5) * 15);
        ctx.stroke();
      }
    } else if (config.type === 'egg_devoured') {
      // Fluxo gravitacional sendo canibalizado
      const streamGrad = ctx.createLinearGradient(cx + radius, cy, cx + radius * 2.2, cy);
      streamGrad.addColorStop(0, 'rgba(255, 180, 0, 0.85)');
      streamGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = streamGrad;
      ctx.beginPath();
      ctx.moveTo(cx + radius * 0.9, cy - radius * 0.3);
      ctx.quadraticCurveTo(cx + radius * 1.8, cy - radius * 0.1, cx + radius * 2.3, cy);
      ctx.quadraticCurveTo(cx + radius * 1.8, cy + radius * 0.1, cx + radius * 0.9, cy + radius * 0.3);
      ctx.fill();
    } else if (config.particleType === 'fire' || config.type === 'ultra_hot') {
      // Labaredas solares
      ctx.fillStyle = '#ffcc00';
      for (let i = 0; i < 70; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = radius * (1 + Math.random() * 0.45);
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 7 + Math.random() * 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Efeito de retícula Ben-Day dots / Meio-tom clássico das impressões de gibi
  drawHalftoneOverlay(ctx, w, h) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const spacing = 20;
    for (let x = 0; x < w; x += spacing) {
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Moldura externa da revista em quadrinhos
  drawVintageBorders(ctx, w, h) {
    ctx.save();
    const margin = 48;
    ctx.strokeStyle = '#05070f';
    ctx.lineWidth = 14;
    ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(margin + 10, margin + 10, w - (margin + 10) * 2, h - (margin + 10) * 2);
    ctx.restore();
  }

  // Selo Vintage no Canto Superior Direito: "APPROVED BY THE COSMIC ARCHIVE AUTHORITY NASA"
  drawComicsCodeSeal(ctx, w, h, isHoriz) {
    ctx.save();
    const margin = 56;
    const sealW = 160;
    const sealH = 185;
    const sealX = w - margin - sealW - 20;
    const sealY = margin + 20;

    // Fundo branco e borda preta
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(sealX, sealY, sealW, sealH);
    ctx.strokeRect(sealX, sealY, sealW, sealH);

    // Textos do selo
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    ctx.font = '900 17px "Outfit", sans-serif';
    ctx.fillText('APPROVED', sealX + sealW / 2, sealY + 30);
    ctx.fillText('BY THE', sealX + sealW / 2, sealY + 52);

    ctx.font = '900 23px "Cinzel", sans-serif';
    ctx.fillStyle = '#e62429';
    ctx.fillText('COSMIC', sealX + sealW / 2, sealY + 84);
    ctx.fillText('ARCHIVE', sealX + sealW / 2, sealY + 114);

    ctx.fillStyle = '#000000';
    ctx.font = '900 15px "Outfit", sans-serif';
    ctx.fillText('AUTHORITY', sealX + sealW / 2, sealY + 143);
    ctx.fillText('★ NASA ★', sealX + sealW / 2, sealY + 168);

    ctx.restore();
  }

  // Box retrô no Canto Superior Esquerdo: "ISSUE #001 - EXTREME WORLDS DAILY" (Sem preço)
  drawIssueBox(ctx, w, h, isHoriz) {
    ctx.save();
    const margin = 56;
    const boxX = margin + 20;
    const boxY = margin + 20;
    const boxW = 185;
    const boxH = 155;

    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.textAlign = 'center';

    const num = this.issueNumber || this.planet.issueNumber || 1;
    const issueStr = `ISSUE #${String(num).padStart(3, '0')}`;

    ctx.fillStyle = '#e62429';
    ctx.font = '900 22px "JetBrains Mono", monospace';
    ctx.fillText(issueStr, boxX + boxW / 2, boxY + 44);

    ctx.fillStyle = '#000000';
    ctx.font = '900 18px "Outfit", sans-serif';
    ctx.fillText('EXTREME', boxX + boxW / 2, boxY + 78);
    ctx.fillText('WORLDS', boxX + boxW / 2, boxY + 104);
    ctx.fillText('DAILY', boxX + boxW / 2, boxY + 130);

    ctx.restore();
  }

  // Placa com o Nome Oficial do Exoplaneta no Canto Inferior Esquerdo (Estilo Comic)
  drawPlanetNamePlate(ctx, w, h, isHoriz) {
    ctx.save();
    const margin = 56;
    const name = this.planet.name;

    // Tamanho proporcional à alta resolução de impressão (300 DPI)
    const fontSize = isHoriz ? 54 : 64;
    ctx.font = `italic 900 ${fontSize}px "Outfit", "Arial Black", sans-serif`;

    const textMetrics = ctx.measureText(name);
    const textWidth = textMetrics.width;

    const padX = isHoriz ? 38 : 46;
    const padY = isHoriz ? 18 : 22;
    const boxW = textWidth + padX * 2;
    const boxH = fontSize + padY * 2;

    const boxX = margin + 18;
    const boxY = h - margin - 18 - boxH;

    // Fundo amarelo clássico de gibi vintage
    ctx.fillStyle = '#ffeb3b';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 7;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    // Nome do planeta em preto itálico pesado
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, boxX + boxW / 2, boxY + boxH / 2 + 3);

    ctx.restore();
  }

  // Título Único e Temático do Planeta (ex: "THE RAZOR RAIN HORROR")
  drawComicTitle(ctx, w, h, isHoriz) {
    ctx.save();
    const title = (this.planet.comicHeroTitle || 'THE COSMIC HORROR').toUpperCase();
    const titleY = isHoriz ? 185 : 240;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = isHoriz ? 88 : 105;
    ctx.font = `900 ${fontSize}px "Cinzel", "Outfit", sans-serif`;

    // Sombra projetada 3D do título
    ctx.fillStyle = '#000000';
    ctx.fillText(title, w / 2 + 7, titleY + 7);

    // Contorno preto de tinta e preenchimento amarelo comic
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 10;
    ctx.strokeText(title, w / 2, titleY);

    ctx.fillStyle = '#ffeb3b';
    ctx.fillText(title, w / 2, titleY);

    ctx.restore();
  }

  // Textura e vinheta de papel antigo envelhecido
  drawVintagePaperVignette(ctx, w, h) {
    ctx.save();
    // Vinheta escura nas quatro bordas
    const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Amarelamento suave de gibi guardado
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255, 245, 220, 0.08)';
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }
}
