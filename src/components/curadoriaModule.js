import { ComicBannerGenerator } from './comicBannerGenerator.js';
import { soundManager } from './soundEffects.js';

let curadoriaData = null;
let selectedCuradoriaPlanet = null;
let currentCuradoriaPosterUrl = null;
let activeToken = null;

export async function mountCuradoria({ token, onLogout }) {
  activeToken = token;

  let viewEl = document.getElementById('viewCuradoria');
  if (!viewEl) {
    const mainEl = document.querySelector('.main-content');
    viewEl = document.createElement('div');
    viewEl.className = 'view-page';
    viewEl.id = 'viewCuradoria';
    viewEl.style.display = 'block';
    mainEl.appendChild(viewEl);
  }

  viewEl.innerHTML = `
    <section class="curadoria-section" id="curadoriaSection">
      <div class="curadoria-header">
        <div class="curadoria-badge-row">
          <span class="badge-status-gold">🛰️ OBSERVATÓRIO DO AUTOR</span>
          <span class="badge-status-pulsing">GRADE DE CURADORIA SEMANAL</span>
          <button id="curadoriaRunCycleBtn" class="btn-curadoria-cycle" title="Disparar Agendamento e Geração de Artes da Próxima Semana">⚡ Executar Ciclo da Próxima Semana</button>
          <button id="curadoriaLogoutBtn" class="btn-curadoria-logout" title="Encerrar Sessão">🔒 Encerrar Sessão</button>
        </div>
        <h2 class="curadoria-title">PAINEL DE CURADORIA SEMANAL</h2>
        <p class="curadoria-subtitle">
          Inspeção antecipada dos 7 exoplanetas da próxima semana (Segunda a Domingo).
          Geração automatizada via <strong>Together AI (FLUX.1.1-pro)</strong> e fluxo manual de alta fidelidade via <strong>Gemini Advanced Web</strong>.
          Valide a história e a telemetria do exoplaneta no dossiê ao lado para aprovar o pôster.
        </p>
      </div>

      <!-- Grade Seletora dos 7 Dias da Semana -->
      <div class="curadoria-week-grid" id="curadoriaWeekGrid">
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2rem;">
          Sincronizando grade telemetrica confidencial com o servidor...
        </div>
      </div>

      <!-- Área de Exibição do Pôster em Destaque e Dossiê Científico -->
      <div class="curadoria-preview-stage" id="curadoriaPreviewStage">
        <div class="stage-info-header">
          <div class="stage-planet-details">
            <div class="stage-badges-row">
              <span class="stage-day-badge" id="stageDayBadge">Segunda-feira</span>
              <span class="stage-issue-badge" id="stageIssueBadge">ISSUE #001</span>
              <span class="stage-orientation-badge" id="stageOrientationBadge">Vertical A4</span>
              <span class="stage-model-badge" id="stageModelBadge">🏆 MOTOR OFICIAL: TOGETHER AI (FLUX.1.1-PRO) + GEMINI PRO WEB</span>
            </div>
            <h3 class="stage-planet-name" id="stagePlanetName">--</h3>
            <p class="stage-planet-title" id="stagePlanetTitle">--</p>
          </div>
          <div class="stage-actions">
            <button class="btn btn-curadoria-copy" id="stageCopyPromptBtn" title="Copiar Prompt Mestre para colar no Gemini Web">
              <span>📋 Copiar Prompt Mestre (Gemini Pro)</span>
            </button>
            <button class="btn btn-curadoria-upload" id="stageUploadBtn" title="Enviar arte gerada no Gemini Web">
              <span>📤 Enviar Arte do Gemini</span>
            </button>
            <input type="file" id="stageFileInput" accept="image/jpeg,image/png,image/webp" style="display: none;" />
            <button class="btn btn-curadoria-regenerate" id="stageRegenerateBtn" disabled>
              <span>🔄 Regenerar Arte (Together AI FLUX)</span>
            </button>
            <button class="btn btn-comic-download" id="stageDownloadBtn" disabled>
              <span>Baixar Pôster A4 Oficial (PNG)</span>
            </button>
          </div>
        </div>

        <!-- Bloco de Dica e Atalho para o Plano Google AI Pro -->
        <div class="curadoria-prompt-tip-box" id="curadoriaTipBox">
          <div class="tip-header">
            <span class="tip-icon">💡</span>
            <strong>FLUXO DUAL DE PRODUÇÃO HOMOLOGADO:</strong>
          </div>
          <ol class="tip-steps">
            <li><strong>Automático (Together AI):</strong> O botão <em>"🔄 Regenerar Arte (Together AI FLUX)"</em> gera instantaneamente via API com FLUX.1.1-pro em 768x1024 nativo.</li>
            <li><strong>Manual (Gemini Pro Web):</strong> Clique em <em>"📋 Copiar Prompt Mestre"</em>, gere no seu <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer" class="curadoria-link">Gemini Advanced Pro ↗</a> e arraste o pôster diretamente sobre o quadro abaixo.</li>
          </ol>
        </div>

        <!-- Corpo Principal: Pôster lado a lado com o Dossiê Científico & História -->
        <div class="curadoria-stage-body">
          <!-- Coluna 1: Canvas Renderizado do Pôster Oficial (Área com suporte a Drag & Drop) -->
          <div class="curadoria-poster-canvas-box" id="curadoriaPosterBox" title="Arraste e solte uma imagem aqui para definir como arte oficial">
            <div class="comic-loading-spinner" id="curadoriaSpinner">
              <span class="spinner-dot"></span>
              <p>Selecione um planeta da grade semanal para renderizar o pôster oficial...</p>
            </div>
            <img id="curadoriaPosterImg" alt="Pôster Oficial da Coleção" style="display: none;" />
            <div class="curadoria-drop-overlay" id="curadoriaDropOverlay">
              <div class="drop-overlay-content">
                <span class="drop-icon">📥</span>
                <p>Solte a imagem aqui para definir como a arte oficial deste exoplaneta!</p>
              </div>
            </div>
          </div>

          <!-- Coluna 2: Dossiê Científico & Validação da História do Planeta -->
          <div class="curadoria-dossier-card" id="curadoriaDossierCard">
            <div class="dossier-header">
              <span class="dossier-tag">DOSSIÊ CIENTÍFICO & NARRATIVA OFICIAL</span>
              <h4 class="dossier-hero-title" id="dossierHeroTitle">--</h4>
              <p class="dossier-catchphrase" id="dossierCatchphrase">--</p>
            </div>

            <div class="dossier-section">
              <h5 class="dossier-section-title">📖 HISTÓRIA & FENÔMENOS EXTREMOS (VALIDAÇÃO DA ARTE)</h5>
              <p class="dossier-description" id="dossierDescription">--</p>
              <div class="dossier-summary-box" id="dossierSummary">--</div>
            </div>

            <div class="dossier-section">
              <h5 class="dossier-section-title">📊 TELEMETRIA CIENTÍFICA</h5>
              <div class="dossier-telemetry-grid">
                <div class="dossier-stat-item">
                  <span class="stat-label">🌡️ Temperatura</span>
                  <strong class="stat-value" id="dossierTemp">--</strong>
                </div>
                <div class="dossier-stat-item">
                  <span class="stat-label">⏱️ Sobrevivência</span>
                  <strong class="stat-value highlight-danger" id="dossierSurvival">--</strong>
                </div>
                <div class="dossier-stat-item">
                  <span class="stat-label">☣️ Perigo Cósmico</span>
                  <strong class="stat-value" id="dossierDanger">--</strong>
                </div>
                <div class="dossier-stat-item">
                  <span class="stat-label">🌌 Distância</span>
                  <strong class="stat-value" id="dossierDistance">--</strong>
                </div>
                <div class="dossier-stat-item">
                  <span class="stat-label">🧭 Constelação</span>
                  <strong class="stat-value" id="dossierConstellation">--</strong>
                </div>
                <div class="dossier-stat-item">
                  <span class="stat-label">🪐 Massa / Raio</span>
                  <strong class="stat-value" id="dossierDimensions">--</strong>
                </div>
                <div class="dossier-stat-item">
                  <span class="stat-label">☀️ Estrela Hospedeira</span>
                  <strong class="stat-value" id="dossierStar">--</strong>
                </div>
                <div class="dossier-stat-item full-width">
                  <span class="stat-label">🧪 Composição Atmosférica</span>
                  <strong class="stat-value" id="dossierAtmosphere">--</strong>
                </div>
              </div>
            </div>

            <div class="dossier-section">
              <h5 class="dossier-section-title">⚡ AMEAÇAS & PECULIARIDADES VISUAIS</h5>
              <div class="dossier-hazard-tags" id="dossierHazardTags"></div>
            </div>

            <details class="dossier-prompt-details">
              <summary class="dossier-prompt-summary">🔍 Inspecionar Prompt Mestre de IA (Inglês Jack Kirby)</summary>
              <pre class="dossier-prompt-text" id="dossierPromptText">--</pre>
            </details>
          </div>
        </div>
      </div>
    </section>
  `;

  const logoutBtn = document.getElementById('curadoriaLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (typeof onLogout === 'function') {
        onLogout();
      }
    });
  }

  const runCycleBtn = document.getElementById('curadoriaRunCycleBtn');
  if (runCycleBtn) {
    runCycleBtn.addEventListener('click', async () => {
      soundManager.playScanBeep();
      if (!confirm('Deseja executar o ciclo semanal da próxima semana agora? Isso agendará os 7 planetas e processará a geração de artes via Cascata de Resiliência.')) {
        return;
      }

      runCycleBtn.disabled = true;
      const originalText = runCycleBtn.innerHTML;
      runCycleBtn.innerHTML = `<span>⏳ Processando Ciclo Semanal...</span>`;

      try {
        const res = await fetch('/api/curadoria/run-weekly-cycle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          }
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Falha ao executar ciclo semanal.');
        }

        alert(`✅ Ciclo semanal concluído com sucesso! Planetas agendados: ${data.scheduledWeek?.length || 0}`);
        await loadCuradoriaDashboard(activeToken);
      } catch (err) {
        alert(`⚠️ Erro ao executar ciclo semanal: ${err.message}`);
      } finally {
        runCycleBtn.disabled = false;
        runCycleBtn.innerHTML = originalText;
      }
    });
  }

  await loadCuradoriaDashboard(token);
}

export function showCuradoria() {
  const el = document.getElementById('viewCuradoria');
  if (el) el.style.display = 'block';
}

export function hideCuradoria() {
  const el = document.getElementById('viewCuradoria');
  if (el) el.style.display = 'none';
}

async function loadCuradoriaDashboard(token) {
  const grid = document.getElementById('curadoriaWeekGrid');
  if (!grid) return;

  try {
    const res = await fetch('/api/curadoria', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error('Sessão expirada ou não autorizada.');
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.weekSchedule) {
      throw new Error(data.error || 'Falha ao obter grade semanal.');
    }

    curadoriaData = data.weekSchedule;
    renderCuradoriaGrid(curadoriaData);

    if (curadoriaData.length > 0) {
      selectCuradoriaPlanet(curadoriaData[0]);
    }
  } catch (err) {
    console.error('Erro na curadoria confidencial:', err);
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--accent-red); padding: 1.5rem; background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md); border: 1px solid rgba(239, 68, 68, 0.3);">
        ⚠️ Falha na autenticação do Observatório: ${err.message}
      </div>
    `;
  }
}

function renderCuradoriaGrid(schedule) {
  const grid = document.getElementById('curadoriaWeekGrid');
  if (!grid) return;

  grid.innerHTML = '';
  schedule.forEach((item) => {
    const card = document.createElement('div');
    const isSelected = selectedCuradoriaPlanet && selectedCuradoriaPlanet.issueNumber === item.issueNumber;
    card.className = `curadoria-day-card ${isSelected ? 'active' : ''}`;
    card.id = `curadoriaCard-${item.planet.id}`;
    card.innerHTML = `
      <span class="curadoria-card-dayname">${item.dayName.split('-')[0]}</span>
      <span class="curadoria-card-issue">${item.issueLabel}</span>
      <h4 class="curadoria-card-planetname">${item.planet.name}</h4>
      <span class="curadoria-card-status ${item.hasArtwork ? 'ready' : 'pending'}">
        ${item.hasArtwork ? '● Arte Pronta' : '○ Aguardando'}
      </span>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.curadoria-day-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      selectCuradoriaPlanet(item);
    });

    grid.appendChild(card);
  });
}

async function selectCuradoriaPlanet(item) {
  selectedCuradoriaPlanet = item;
  const p = { ...item.planet };

  // Adiciona o token à URL da imagem para que o backend permita acesso seguro antecipado
  const cacheBust = item._cacheBust ? `&v=${item._cacheBust}` : '';
  if (activeToken) {
    p.customArtworkUrl = `/assets/planets/${p.id}.jpg?token=${encodeURIComponent(activeToken)}${cacheBust}`;
  }

  const stageDayBadge = document.getElementById('stageDayBadge');
  const stageIssueBadge = document.getElementById('stageIssueBadge');
  const stageOrientationBadge = document.getElementById('stageOrientationBadge');
  const stagePlanetName = document.getElementById('stagePlanetName');
  const stagePlanetTitle = document.getElementById('stagePlanetTitle');
  const spinner = document.getElementById('curadoriaSpinner');
  const img = document.getElementById('curadoriaPosterImg');
  const downloadBtn = document.getElementById('stageDownloadBtn');
  const regenerateBtn = document.getElementById('stageRegenerateBtn');
  const copyPromptBtn = document.getElementById('stageCopyPromptBtn');
  const uploadBtn = document.getElementById('stageUploadBtn');
  const fileInput = document.getElementById('stageFileInput');
  const posterBox = document.getElementById('curadoriaPosterBox');
  const dropOverlay = document.getElementById('curadoriaDropOverlay');

  if (stageDayBadge) stageDayBadge.textContent = `${item.dayName} • ${item.scheduledDate}`;
  if (stageIssueBadge) stageIssueBadge.textContent = item.issueLabel;
  if (stageOrientationBadge) stageOrientationBadge.textContent = p.bannerOrientation === 'horizontal' ? 'Horizontal A4' : 'Vertical A4';
  if (stagePlanetName) stagePlanetName.textContent = p.name;
  if (stagePlanetTitle) stagePlanetTitle.textContent = (p.comicHeroTitle || p.title).toUpperCase();

  // Preenchimento do Dossiê Científico e Validação Narrativa
  const dossierHeroTitle = document.getElementById('dossierHeroTitle');
  const dossierCatchphrase = document.getElementById('dossierCatchphrase');
  const dossierDescription = document.getElementById('dossierDescription');
  const dossierSummary = document.getElementById('dossierSummary');
  const dossierTemp = document.getElementById('dossierTemp');
  const dossierSurvival = document.getElementById('dossierSurvival');
  const dossierDanger = document.getElementById('dossierDanger');
  const dossierDistance = document.getElementById('dossierDistance');
  const dossierConstellation = document.getElementById('dossierConstellation');
  const dossierDimensions = document.getElementById('dossierDimensions');
  const dossierStar = document.getElementById('dossierStar');
  const dossierAtmosphere = document.getElementById('dossierAtmosphere');
  const dossierHazardTags = document.getElementById('dossierHazardTags');
  const dossierPromptText = document.getElementById('dossierPromptText');

  if (dossierHeroTitle) dossierHeroTitle.textContent = (p.comicHeroTitle || p.title || p.name).toUpperCase();
  if (dossierCatchphrase) dossierCatchphrase.textContent = p.comicCatchphrase || p.comicSubtitle || 'UMA ANOMALIA CÓSMICA REGISTRADA!';
  if (dossierDescription) dossierDescription.textContent = p.description || 'História detalhada não cadastrada no acervo.';
  if (dossierSummary) {
    dossierSummary.innerHTML = `<strong>Resumo Executivo:</strong> ${p.summary || 'Dados sob análise telemetrica.'}`;
  }
  if (dossierTemp) dossierTemp.textContent = p.tempC !== undefined ? `${p.tempC} °C / ${p.tempF || Math.round(p.tempC * 9/5 + 32)} °F` : '--';
  if (dossierSurvival) dossierSurvival.textContent = p.survivalTime || 'Desconhecido';
  if (dossierDanger) dossierDanger.textContent = `${p.dangerLevel || '?'}/10 — ${p.dangerLabel || p.category || 'Extremo'}`;
  if (dossierDistance) dossierDistance.textContent = `${p.distanceLy || '?'} anos-luz`;
  if (dossierConstellation) dossierConstellation.textContent = p.constellation || '--';
  if (dossierDimensions) dossierDimensions.textContent = `${p.massVsEarth || '?'}x Terra (Massa) | ${p.radiusVsEarth || '?'}x (Raio)`;
  if (dossierStar) dossierStar.textContent = p.starType || '--';
  if (dossierAtmosphere) dossierAtmosphere.textContent = p.atmosphere || '--';

  if (dossierHazardTags) {
    dossierHazardTags.innerHTML = '';
    const tags = p.hazardTags || [];
    tags.forEach(t => {
      const tagSpan = document.createElement('span');
      tagSpan.className = 'dossier-hazard-badge';
      tagSpan.textContent = `⚡ ${t}`;
      dossierHazardTags.appendChild(tagSpan);
    });
  }

  if (dossierPromptText) {
    dossierPromptText.textContent = item.prompt || 'Prompt mestre não disponível.';
  }

  if (spinner) {
    spinner.style.display = 'block';
    spinner.innerHTML = `<span class="spinner-dot"></span><p>Renderizando pôster oficial com selos e tipografia...</p>`;
  }
  if (img) img.style.display = 'none';
  if (downloadBtn) downloadBtn.disabled = true;
  if (regenerateBtn) regenerateBtn.disabled = false;

  // 1. Configura ação de COPIAR PROMPT MESTRE
  if (copyPromptBtn) {
    copyPromptBtn.onclick = async () => {
      soundManager.playScanBeep();
      const promptToCopy = item.prompt || (p.comicHeroTitle ? `Retro pulp sci-fi poster of ${p.name}` : '');
      if (!promptToCopy) {
        alert('⚠️ Prompt mestre não disponível para este exoplaneta.');
        return;
      }

      try {
        await navigator.clipboard.writeText(promptToCopy);
        const originalHtml = copyPromptBtn.innerHTML;
        copyPromptBtn.innerHTML = `<span>✅ Prompt Copiado! Cole no Gemini</span>`;
        copyPromptBtn.classList.add('copied');
        soundManager.playChime();
        setTimeout(() => {
          copyPromptBtn.innerHTML = originalHtml;
          copyPromptBtn.classList.remove('copied');
        }, 3500);
      } catch (err) {
        prompt('Copie o prompt manualmente abaixo:', promptToCopy);
      }
    };
  }

  // 2. Configura ação de UPLOAD MANUAL DE ARTE
  if (uploadBtn && fileInput) {
    uploadBtn.onclick = () => {
      fileInput.value = '';
      fileInput.click();
    };

    fileInput.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleArtworkUpload(file, item);
      }
    };
  }

  // 3. Configura ação de DRAG & DROP direto sobre o quadro do pôster
  if (posterBox) {
    posterBox.ondragover = (e) => {
      e.preventDefault();
      e.stopPropagation();
      posterBox.classList.add('drag-over');
      if (dropOverlay) dropOverlay.style.display = 'flex';
    };

    posterBox.ondragleave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      posterBox.classList.remove('drag-over');
      if (dropOverlay) dropOverlay.style.display = 'none';
    };

    posterBox.ondrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      posterBox.classList.remove('drag-over');
      if (dropOverlay) dropOverlay.style.display = 'none';

      const file = e.dataTransfer?.files?.[0];
      if (file) {
        handleArtworkUpload(file, item);
      }
    };
  }

  // Configura ação do botão Regenerar Arte via API
  if (regenerateBtn) {
    regenerateBtn.onclick = async () => {
      soundManager.playScanBeep();
      if (!confirm(`Deseja gerar uma nova arte para "${p.name}" via Cascata de IA?`)) {
        return;
      }

      regenerateBtn.disabled = true;
      const origText = regenerateBtn.innerHTML;
      regenerateBtn.innerHTML = `<span>⏳ Gerando na Cascata de IA...</span>`;
      if (spinner) {
        spinner.style.display = 'block';
        spinner.innerHTML = `<span class="spinner-dot"></span><p>Solicitando nova arte à Cascata de IA no padrão Full-Bleed...</p>`;
      }

      try {
        const res = await fetch('/api/curadoria/regenerate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeToken}`
          },
          body: JSON.stringify({ planetId: p.id })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Falha ao regenerar arte.');
        }

        // Marca como arte pronta na grade e no item atual
        item.hasArtwork = true;
        item._cacheBust = Date.now();

        const cardEl = document.getElementById(`curadoriaCard-${p.id}`);
        if (cardEl) {
          const statusEl = cardEl.querySelector('.curadoria-card-status');
          if (statusEl) {
            statusEl.className = 'curadoria-card-status ready';
            statusEl.textContent = '● Arte Pronta';
          }
        }

        alert(`✅ Nova arte de ${p.name} gerada e salva com sucesso!`);
        await selectCuradoriaPlanet(item);
      } catch (err) {
        alert(`⚠️ Erro ao gerar arte: ${err.message}\n(Verifique as chaves no seu .env)`);
      } finally {
        regenerateBtn.disabled = false;
        regenerateBtn.innerHTML = origText;
      }
    };
  }

  try {
    const generator = new ComicBannerGenerator(p, p.bannerOrientation, item.cryptoCertificate || p.cryptoCertificate);
    currentCuradoriaPosterUrl = await generator.generatePoster(true);

    if (spinner) spinner.style.display = 'none';
    if (img) {
      img.src = currentCuradoriaPosterUrl;
      img.style.display = 'block';
    }

    if (downloadBtn) {
      downloadBtn.disabled = false;
      downloadBtn.onclick = async () => {
        soundManager.playScanBeep();
        downloadBtn.disabled = true;
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = `<span>Processando PNG 300 DPI...</span>`;
        try {
          const fullPng = await generator.generatePoster(false);
          const link = document.createElement('a');
          const cleanName = p.name.replace(/\s+/g, '-').toUpperCase();
          link.download = `COLECAO-${item.issueLabel}-${cleanName}-POSTER-A4.png`;
          link.href = fullPng;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = originalText;
        }
      };
    }
  } catch (err) {
    console.error('Erro ao renderizar banner na curadoria:', err);
    if (spinner) {
      spinner.innerHTML = `<p style="color: var(--accent-red)">Erro ao processar arte do pôster: ${err.message || ''}</p>`;
    }
  }
}

/**
 * Processa o upload de uma imagem arrastada ou selecionada para um exoplaneta
 */
async function handleArtworkUpload(file, item) {
  if (!file || !item) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    alert('⚠️ Formato inválido. Por favor selecione uma imagem nos formatos JPG, PNG ou WEBP.');
    return;
  }

  soundManager.playScanBeep();
  const spinner = document.getElementById('curadoriaSpinner');
  const img = document.getElementById('curadoriaPosterImg');

  if (spinner) {
    spinner.style.display = 'block';
    spinner.innerHTML = `<span class="spinner-dot"></span><p>Arquivando arte de "${item.planet.name}" no observatório...</p>`;
  }
  if (img) img.style.display = 'none';

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;
    try {
      const res = await fetch('/api/curadoria/upload-artwork', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          planetId: item.planet.id,
          imageBase64: base64Data
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao salvar arte enviada.');
      }

      soundManager.playChime();
      item.hasArtwork = true;
      item._cacheBust = Date.now();

      const cardEl = document.getElementById(`curadoriaCard-${item.planet.id}`);
      if (cardEl) {
        const statusEl = cardEl.querySelector('.curadoria-card-status');
        if (statusEl) {
          statusEl.className = 'curadoria-card-status ready';
          statusEl.textContent = '● Arte Pronta';
        }
      }

      alert(`🎉 Sucesso! A arte de "${item.planet.name}" foi salva com sucesso e o pôster oficial foi atualizado com selos NASA e tipografia!`);
      await selectCuradoriaPlanet(item);
    } catch (err) {
      alert(`⚠️ Erro ao salvar arte: ${err.message}`);
      if (spinner) spinner.style.display = 'none';
      if (img) img.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}
