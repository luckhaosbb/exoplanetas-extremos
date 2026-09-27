/**
 * Motor de Captura e Síntese de Snapshot Fotográfico de Telemetria 3D
 * Gera uma imagem em alta resolução (1200x1380px) da tela de observação
 * do sensor 3D do site, incluindo monitor CRT, scanlines e coordenadas orbitais
 * (com arte limpa do planeta, sem elementos de controle/ângulo na foto final).
 */

export function generateTelemetrySnapshot(planet, renderer) {
  const canvas = document.createElement('canvas');
  const w = 1200;
  const h = 1380;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const pad = 44;
  const cardRadius = 24;

  // 1. Fundo do Card (Deep Space Observational Monitor)
  ctx.save();
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 200, w / 2, h / 2, 850);
  bgGrad.addColorStop(0, '#070b16');
  bgGrad.addColorStop(0.7, '#04060c');
  bgGrad.addColorStop(1, '#020306');
  ctx.fillStyle = bgGrad;

  // Desenha o retângulo arredondado do card externo
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(0, 0, w, h, cardRadius);
  } else {
    ctx.rect(0, 0, w, h);
  }
  ctx.fill();

  // Borda sutil de monitor retrô espacial
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();

  // 2. Header Superior do Sensor
  const headerY = pad;
  const btnW = 230;
  const btnH = 46;

  // Badge/Botão "SENSOR 3D"
  ctx.save();
  ctx.fillStyle = 'rgba(16, 24, 40, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(pad, headerY, btnW, btnH, 6);
  } else {
    ctx.rect(pad, headerY, btnW, btnH);
  }
  ctx.fill();
  ctx.stroke();

  // Ícone e texto "SENSOR 3D"
  ctx.font = '700 18px "Outfit", system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('📡  SENSOR 3D', pad + 18, headerY + btnH / 2);

  // KBD Badge "CTRL"
  const kbdW = 54;
  const kbdH = 28;
  const kbdX = pad + btnW - kbdW - 10;
  const kbdY = headerY + (btnH - kbdH) / 2;
  ctx.fillStyle = '#141b2d';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(kbdX, kbdY, kbdW, kbdH, 4);
  } else {
    ctx.rect(kbdX, kbdY, kbdW, kbdH);
  }
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.textAlign = 'center';
  ctx.fillText('CTRL', kbdX + kbdW / 2, kbdY + kbdH / 2 + 1);

  // Texto à direita: "↻ Arraste para rotacionar"
  ctx.font = '500 17px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('↻ Arraste para rotacionar', w - pad, headerY + btnH / 2);
  ctx.restore();

  // 3. Área Central do Planeta 3D (Canvas Wrapper)
  const canvasAreaY = headerY + btnH + 18;
  const canvasAreaSize = w - pad * 2; // 1112 x 1112 px

  ctx.save();
  // Fundo escuro do viewport
  ctx.fillStyle = '#020408';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(pad, canvasAreaY, canvasAreaSize, canvasAreaSize, 14);
  } else {
    ctx.rect(pad, canvasAreaY, canvasAreaSize, canvasAreaSize);
  }
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.clip(); // Corta para não vazar scanlines

  // Desenha o Canvas 3D do planeta (renderizado limpo em resolução nativa sem elementos de ângulo)
  if (renderer) {
    if (typeof renderer.captureCleanSnapshot === 'function') {
      const cleanPlanetCanvas = renderer.captureCleanSnapshot(canvasAreaSize);
      ctx.drawImage(cleanPlanetCanvas, pad, canvasAreaY, canvasAreaSize, canvasAreaSize);
    } else if (renderer.canvas) {
      ctx.drawImage(renderer.canvas, pad, canvasAreaY, canvasAreaSize, canvasAreaSize);
    }
  }

  // Efeito CRT Scanlines (Linhas horizontais de monitor retrô)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
  for (let y = canvasAreaY; y < canvasAreaY + canvasAreaSize; y += 3) {
    ctx.fillRect(pad, y, canvasAreaSize, 1.2);
  }

  // Vinheta suave nas bordas do viewport
  const vigGrad = ctx.createRadialGradient(
    pad + canvasAreaSize / 2,
    canvasAreaY + canvasAreaSize / 2,
    canvasAreaSize * 0.38,
    pad + canvasAreaSize / 2,
    canvasAreaY + canvasAreaSize / 2,
    canvasAreaSize * 0.62
  );
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(pad, canvasAreaY, canvasAreaSize, canvasAreaSize);

  ctx.restore();

  // 4. Footer Inferior do Monitor (Telemetria & Coordenadas)
  const footerY = canvasAreaY + canvasAreaSize + 28;

  ctx.save();
  // Ponto de status verde brilhante com aura (glow)
  const dotX = pad + 8;
  const dotY = footerY;

  ctx.beginPath();
  ctx.arc(dotX, dotY, 9, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34, 197, 94, 0.25)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();

  // Texto de status: "TELEMETRIA ORBITAL ATIVA"
  ctx.font = '700 17px "JetBrains Mono", monospace';
  ctx.fillStyle = '#22c55e';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TELEMETRIA ORBITAL ATIVA', dotX + 16, dotY);

  // Coordenadas à direita
  const constName = (planet?.constellation || 'OPHIUCHUS (OFIÚCO)').toUpperCase();
  const distLy = planet?.distanceLy ? `${planet.distanceLy} LY` : '-- LY';

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';

  const fullCoordText = `${constName} • ${distLy}`;
  ctx.font = '500 17px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.65)';
  
  // Mede largura para renderizar "COORDENADAS:" em cinza e o valor em destaque
  const labelText = 'COORDENADAS: ';
  ctx.fillText(labelText, w - pad - ctx.measureText(fullCoordText).width, dotY);

  ctx.font = '700 17px "JetBrains Mono", monospace';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(fullCoordText, w - pad, dotY);

  ctx.restore();

  return canvas.toDataURL('image/png');
}
