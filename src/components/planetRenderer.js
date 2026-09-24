// Motor de Renderização 3D Retrô-Monitor (Estética Terminal Espacial & Arcade)
// Projeção esférica tridimensional com marcas de superfície visíveis, sensação de giro imediata e inércia física tangível.

export class PlanetRenderer {
  constructor(canvasElement, planetData) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.planet = planetData;
    this.animId = null;
    
    // Rotação e física de inércia
    this.rotation = 0;
    this.rotationVelocity = 0.008;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.particles = [];
    this.time = 0;

    // Dimensões virtuais e DPR
    this.width = 400;
    this.height = 400;

    // Modo Sensor Térmico (ativado por CTRL, T ou clique)
    this.isThermalMode = false;

    this.init();
  }

  init() {
    this.setupResizeObserver();
    this.resizeCanvas();
    this.createParticles();
    this.bindEvents();
    this.render();
  }

  setupResizeObserver() {
    if (window.ResizeObserver && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }
  }

  resizeCanvas() {
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.width = Math.max(rect.width, 280);
    this.height = Math.max(rect.height, 280);

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  setPlanet(planetData) {
    this.planet = planetData;
    this.particles = [];
    this.createParticles();
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resizeCanvas());

    // Eventos de Mouse com resposta imediata e feedback de cursor
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
      this.rotationVelocity = 0;
      this.canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        // Resposta imediata de rotação 1:1 com o movimento do cursor
        this.rotation += deltaX * 0.015;
        this.rotationVelocity = deltaX * 0.008;
        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
      }
    });

    // Eventos de Toque (Mobile / Tablets)
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.rotationVelocity = 0;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        this.rotation += deltaX * 0.015;
        this.rotationVelocity = deltaX * 0.008;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Ativação do Sensor Térmico Infravermelho via CTRL ou tecla T
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Control' || e.key.toLowerCase() === 't') {
        this.toggleThermalMode();
      }
    });

    const badge = document.getElementById('sensorModeBadge');
    if (badge) {
      badge.addEventListener('click', () => {
        this.toggleThermalMode();
      });
    }
  }

  toggleThermalMode() {
    this.isThermalMode = !this.isThermalMode;
    const badge = document.getElementById('sensorModeBadge');
    if (badge) {
      if (this.isThermalMode) {
        badge.innerHTML = `<span class="sensor-icon">🔥</span><span class="sensor-name">MODO FLIR</span><kbd class="ctrl-kbd active">CTRL</kbd>`;
        badge.classList.add('thermal-active');
      } else {
        badge.innerHTML = `<span class="sensor-icon">📡</span><span class="sensor-name">SENSOR 3D</span><kbd class="ctrl-kbd">CTRL</kbd>`;
        badge.classList.remove('thermal-active');
      }
    }
  }

  createParticles() {
    const config = this.planet.visualConfig || {};
    const count = config.type === 'dark_abyss' ? 25 : (config.type === 'glass_storm' ? 75 : 55);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speedX: config.type === 'glass_storm' ? (Math.random() * 5 + 4) : ((Math.random() - 0.5) * 1.5),
        speedY: config.type === 'glass_storm' ? ((Math.random() - 0.5) * 1.2) : ((Math.random() - 0.5) * 1.5),
        opacity: Math.random() * 0.7 + 0.3,
        color: config.secondaryColor || '#00ffff',
        angle: Math.random() * Math.PI * 2,
        twinkle: Math.random() * Math.PI
      });
    }
  }

  // Fundo Cósmico & Malha de Sensor Arcade
  drawBackground() {
    const ctx = this.ctx;
    ctx.save();
    
    ctx.fillStyle = '#05070e';
    ctx.fillRect(0, 0, this.width, this.height);

    const config = this.planet.visualConfig || {};
    const nebula = ctx.createRadialGradient(
      this.width / 2, this.height / 2, 10,
      this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.7
    );
    nebula.addColorStop(0, config.glowColor ? config.glowColor.replace(/[\d\.]+\)$/, '0.18)') : 'rgba(0, 150, 255, 0.15)');
    nebula.addColorStop(1, 'rgba(5, 7, 14, 0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, this.width, this.height);

    // Estrelas de fundo
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) {
      const sx = (Math.sin(i * 123.4) * 0.5 + 0.5) * this.width;
      const sy = (Math.cos(i * 567.8) * 0.5 + 0.5) * this.height;
      ctx.globalAlpha = 0.2 + (Math.sin(this.time * 2 + i) * 0.5 + 0.5) * 0.5;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    ctx.restore();
  }

  // Mira de Sensores Retrô HUD
  drawHudOverlay(centerX, centerY, radius) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;

    // Círculo orbital de referência
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.35, 0, Math.PI * 2);
    ctx.stroke();

    // Marcadores angulares de sensor (TICKS)
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const x1 = centerX + Math.cos(a) * (radius * 1.32);
      const y1 = centerY + Math.sin(a) * (radius * 1.32);
      const x2 = centerX + Math.cos(a) * (radius * 1.38);
      const y2 = centerY + Math.sin(a) * (radius * 1.38);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Retículo central
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(centerX - 12, centerY);
    ctx.lineTo(centerX + 12, centerY);
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX, centerY + 12);
    ctx.stroke();

    // Telemetria discreta no HUD do canvas
    ctx.font = '11px "JetBrains Mono", monospace';
    const degrees = Math.round(((this.rotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)) * (180 / Math.PI));
    
    if (this.isThermalMode) {
      ctx.fillStyle = 'rgba(255, 140, 40, 0.95)';
      ctx.fillText(`FLIR TÉRMICO: ${this.planet.tempC} °C`, 14, 22);
      ctx.fillText(`ÂNGULO: ${degrees}°`, 14, this.height - 14);
    } else {
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.fillText(`ÂNGULO: ${degrees}°`, 14, this.height - 14);
    }

    ctx.restore();
  }

  // Atmosfera & Corona
  drawAtmosphereGlow(radius, centerX, centerY) {
    const ctx = this.ctx;
    const config = this.planet.visualConfig || {};
    ctx.save();

    const coronaGrad = ctx.createRadialGradient(
      centerX, centerY, radius * 0.9,
      centerX, centerY, radius * 1.55
    );

    if (this.isThermalMode) {
      coronaGrad.addColorStop(0, 'rgba(255, 80, 0, 0.9)');
      coronaGrad.addColorStop(0.4, 'rgba(255, 180, 0, 0.45)');
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      coronaGrad.addColorStop(0, config.glowColor || 'rgba(0, 200, 255, 0.8)');
      coronaGrad.addColorStop(0.4, config.atmosphereColor || 'rgba(0, 150, 255, 0.3)');
      coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }

    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Esfera Tridimensional com Marcas Visíveis de Rotação
  drawPlanetBody(radius, centerX, centerY) {
    const ctx = this.ctx;
    const config = this.planet.visualConfig || {};
    const type = config.type;

    ctx.save();

    // Para o planeta oval WASP-12b (canibalizado por maré)
    ctx.beginPath();
    if (type === 'egg_devoured') {
      ctx.ellipse(centerX, centerY, Math.max(0.1, radius * 1.35), Math.max(0.1, radius * 0.85), 0.1, 0, Math.PI * 2);
    } else {
      ctx.arc(centerX, centerY, Math.max(0.1, radius), 0, Math.PI * 2);
    }
    ctx.clip();

    // Iluminação esférica 3D base
    const lightX = centerX - radius * 0.45;
    const lightY = centerY - radius * 0.45;
    const sphereGrad = ctx.createRadialGradient(
      lightX, lightY, radius * 0.08,
      centerX, centerY, radius * 1.15
    );

    if (this.isThermalMode) {
      sphereGrad.addColorStop(0, '#ffffff'); // Núcleo superaquecido
      sphereGrad.addColorStop(0.18, '#ffeb3b'); // Amarelo infravermelho
      sphereGrad.addColorStop(0.45, '#ff3d00'); // Vermelho térmico
      sphereGrad.addColorStop(0.72, '#9c27b0'); // Roxo térmico
      sphereGrad.addColorStop(0.9, '#00b0ff'); // Azul / frio
      sphereGrad.addColorStop(1, '#050714');
    } else {
      sphereGrad.addColorStop(0, '#ffffff');
      sphereGrad.addColorStop(0.2, config.secondaryColor || '#ffbb00');
      sphereGrad.addColorStop(0.65, config.primaryColor || '#ff3300');
      sphereGrad.addColorStop(1, '#020308');
    }

    ctx.fillStyle = sphereGrad;
    ctx.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3);

    // Detalhes da superfície com projeção tridimensional rotacional REAL
    this.drawTrue3DSurfaceFeatures(ctx, radius, centerX, centerY, type, config);

    // Sombra terminadora profunda (Noite cósmica)
    const shadowGrad = ctx.createRadialGradient(
      centerX + radius * 0.38, centerY + radius * 0.38, radius * 0.15,
      centerX, centerY, radius * 1.05
    );
    shadowGrad.addColorStop(0, 'rgba(3, 4, 10, 0.94)');
    shadowGrad.addColorStop(0.55, 'rgba(3, 4, 10, 0.6)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = shadowGrad;
    ctx.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3);

    ctx.restore();
  }

  // Projeção Tridimensional Fiel com Sensação Tangível de Giro
  drawTrue3DSurfaceFeatures(ctx, radius, centerX, centerY, type, config) {
    ctx.save();
    const rot = this.rotation;
    const tilt = 0.22; // Inclinação axial de 12.6°

    // 1. Faixas Atmosféricas e Meridianos Curvos com Perspectiva 3D
    ctx.lineWidth = 2.5;
    for (let m = 0; m < 6; m++) {
      const lon = (m * Math.PI / 3) + rot;
      const cosLon = Math.cos(lon);
      const sinLon = Math.sin(lon);

      // Desenha o meridiano apenas quando estiver na face visível (Z > 0)
      if (cosLon > 0) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.12 * cosLon})`;
        ctx.beginPath();
        // Elipse de projeção do meridiano no hemisfério visível (raio deve ser estritamente não-negativo)
        const rx = Math.max(0.1, Math.abs(radius * sinLon));
        const ry = Math.max(0.1, radius * 0.98);
        const startAngle = sinLon >= 0 ? -Math.PI / 2 : Math.PI / 2;
        const endAngle = sinLon >= 0 ? Math.PI / 2 : 3 * Math.PI / 2;
        ctx.ellipse(centerX, centerY, rx, ry, tilt, startAngle, endAngle);
        ctx.stroke();
      }
    }

    // 2. Vórtices e Tempestades Gigantes que Cruzam o Planeta em 3D
    const stormFeatures = [
      { lon: 0, lat: -0.25, size: 0.32, color: 'rgba(255, 255, 255, 0.85)', glow: config.secondaryColor || '#00f0ff' },
      { lon: Math.PI * 0.7, lat: 0.35, size: 0.24, color: 'rgba(255, 255, 255, 0.75)', glow: config.primaryColor || '#0055ff' },
      { lon: Math.PI * 1.35, lat: -0.1, size: 0.28, color: 'rgba(255, 255, 255, 0.8)', glow: config.secondaryColor || '#ffbb00' }
    ];

    stormFeatures.forEach(feat => {
      const curLon = feat.lon + rot;
      const z = Math.cos(curLon); // Profundidade (Z > 0 está na face frontal voltada para a câmera)

      if (z > -0.1) {
        // Posição na tela com projeção senoidal e compressão lateral nas bordas
        const px = centerX + radius * Math.sin(curLon) * Math.cos(feat.lat);
        const py = centerY + radius * Math.sin(feat.lat) + radius * Math.cos(curLon) * Math.sin(feat.lat) * tilt;
        
        // Compressão em perspectiva perto do horizonte (foreshortening)
        const scaleX = Math.max(0.15, Math.abs(z));
        const rSize = radius * feat.size;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(tilt);
        ctx.scale(scaleX, 1);

        const vGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(0.1, rSize));
        vGrad.addColorStop(0, feat.color);
        vGrad.addColorStop(0.4, feat.glow);
        vGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = vGrad;
        ctx.globalAlpha = Math.min(1, Math.max(0, z)); // Fade out ao cruzar a borda do horizonte
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.1, rSize), 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });

    // 3. Efeitos Específicos por Tipo de Planeta
    if (type === 'glass_storm') {
      // Faixas de cisalhamento supersônicas horizontais que ondulam com a rotação
      ctx.lineWidth = 3;
      for (let i = -3; i <= 3; i++) {
        const y = centerY + i * (radius * 0.24);
        const xOffset = Math.sin(rot * 2 + i) * (radius * 0.25);
        ctx.strokeStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.35)' : 'rgba(255, 255, 255, 0.25)';
        ctx.beginPath();
        ctx.ellipse(centerX + xOffset * 0.4, y, Math.max(0.1, radius * 0.96), Math.max(0.1, radius * 0.08), tilt, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (type === 'ultra_hot' || type === 'iron_rain' || type === 'diamond_lava') {
      // Fissuras de lava que giram com a crosta planetária
      ctx.strokeStyle = config.secondaryColor || '#ffff55';
      ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3) + rot;
        const z = Math.cos(angle);
        if (z > 0) {
          const x1 = centerX + Math.sin(angle) * (radius * 0.3);
          const y1 = centerY + Math.cos(angle) * (radius * 0.2);
          const x2 = centerX + Math.sin(angle + 0.3) * (radius * 0.85);
          const y2 = centerY + Math.cos(angle + 0.3) * (radius * 0.7);

          ctx.globalAlpha = z;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(centerX + Math.sin(angle + 0.15) * (radius * 0.6), centerY, x2, y2);
          ctx.stroke();
        }
      }
    } else if (type === 'pulsar_radiation') {
      // Arcos elétricos rotativos
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 2.5;
      for (let i = 1; i <= 3; i++) {
        const pulseR = ((this.time * 40 + i * 25) % (radius * 0.9)) + radius * 0.1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Partículas Voadoras Específicas do Perigo Cósmico
  drawParticles(centerX, centerY, radius) {
    const ctx = this.ctx;
    const config = this.planet.visualConfig || {};
    const type = config.type;

    ctx.save();
    this.particles.forEach((p) => {
      if (type === 'glass_storm') {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > this.width) p.x = 0;
        if (p.y > this.height) p.y = 0;
        if (p.y < 0) p.y = this.height;

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.speedX * 4, p.y + p.speedY * 2);
        ctx.stroke();

      } else if (type === 'diamond_lava') {
        p.y -= 0.6;
        if (p.y < 0) p.y = this.height;
        p.twinkle += 0.05;
        const shimmer = Math.sin(p.twinkle) * 0.5 + 0.5;

        ctx.fillStyle = '#00ffff';
        ctx.globalAlpha = p.opacity * shimmer;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + shimmer * 0.5), 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'iron_rain') {
        p.y += 3.5;
        if (p.y > this.height) p.y = 0;
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x, p.y + 12);
        ctx.stroke();

      } else {
        p.x += Math.cos(p.angle) * 0.7;
        p.y += Math.sin(p.angle) * 0.7;
        p.angle += 0.02;
        if (p.x < 0 || p.x > this.width) p.x = Math.random() * this.width;
        if (p.y < 0 || p.y > this.height) p.y = Math.random() * this.height;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.time += 0.016;

    // Rotação contínua ou inércia física amortecida após o arraste
    if (!this.isDragging) {
      this.rotation += this.rotationVelocity;
      // Retorno suave à velocidade de cruzeiro de órbita
      this.rotationVelocity = this.rotationVelocity * 0.95 + 0.006 * 0.05;
    }

    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radius = Math.min(this.width, this.height) * 0.28;

    this.drawBackground();
    this.drawHudOverlay(centerX, centerY, radius);
    this.drawAtmosphereGlow(radius, centerX, centerY);
    this.drawPlanetBody(radius, centerX, centerY);
    this.drawParticles(centerX, centerY, radius);

    this.animId = requestAnimationFrame(() => this.render());
  }

  destroy() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
