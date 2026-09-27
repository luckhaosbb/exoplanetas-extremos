import './style.css';
import { getDailyExoplanetFallback } from './data/exoplanets.js';
import { PlanetRenderer } from './components/planetRenderer.js';
import { ComicBannerGenerator } from './components/comicBannerGenerator.js';
import { fetchNasaExoplanetData } from './components/nasaApi.js';
import { soundManager } from './components/soundEffects.js';
import { generateTelemetrySnapshot } from './components/telemetrySnapshotGenerator.js';

// Application State
let currentPlanet = null;
let currentPosterDataUrl = null;
let heroRenderer = null;
let isComingSoonMode = false;
let targetLaunchTimeMs = null;

// DOM Elements
const heroCanvas = document.getElementById('heroCanvas');
const currentDateDisplay = document.getElementById('currentDateDisplay');
const countdownClock = document.getElementById('countdownClock');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');

// Hero Information Elements
const heroPlanetName = document.getElementById('heroPlanetName');
const heroPlanetTitle = document.getElementById('heroPlanetTitle');
const heroPlanetSummary = document.getElementById('heroPlanetSummary');
const heroThreatScore = document.getElementById('heroThreatScore');
const heroCategory = document.getElementById('heroCategory');
const heroConstellation = document.getElementById('heroConstellation');
const heroCoordBadge = document.getElementById('heroCoordBadge');

const heroTemp = document.getElementById('heroTemp');
const heroDistance = document.getElementById('heroDistance');
const heroSurvival = document.getElementById('heroSurvival');
const heroMass = document.getElementById('heroMass');

const survivalNarrative = document.getElementById('survivalNarrative');
const simulateSurvivalBtn = document.getElementById('simulateSurvivalBtn');
const nasaStatusText = document.getElementById('nasaStatusText');

// Dossier Elements
const dossierSpecsList = document.getElementById('dossierSpecsList');
const dossierHazardTags = document.getElementById('dossierHazardTags');
const dossierDescription = document.getElementById('dossierDescription');

// Comic Poster Elements
const posterOrientationPill = document.getElementById('posterOrientationPill');
const comicPosterPreviewCard = document.getElementById('comicPosterPreviewCard');
const comicLoadingSpinner = document.getElementById('comicLoadingSpinner');
const comicPosterImg = document.getElementById('comicPosterImg');
const downloadPosterBtn = document.getElementById('downloadPosterBtn');

// Initialize Application
async function initApp() {
  updateCurrentDateText();
  startCountdownTimer();
  bindEvents();
  await loadDailyPlanet();
}

// Format today's date in Portuguese
function updateCurrentDateText() {
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  currentDateDisplay.textContent = now.toLocaleDateString('pt-BR', options);
}

const PREVIEW_ISSUES = [
  { id: 'hd-189733b', issue: 1, name: 'HD 189733b', title: 'The Razor Rain Horror' },
  { id: 'kelt-9b', issue: 2, name: 'KELT-9b', title: 'The Stellar Furnace' },
  { id: 'wasp-76b', issue: 3, name: 'WASP-76b', title: 'The Iron Deluge' },
  { id: 'tres-2b', issue: 4, name: 'TrES-2b', title: 'The Lightless Void' },
  { id: 'wasp-12b', issue: 5, name: 'WASP-12b', title: 'The Devouring Oval' },
  { id: '55-cancri-e', issue: 6, name: '55 Cancri e', title: 'The Diamond Crucible' },
  { id: 'psr-b1257-12c', issue: 7, name: 'PSR B1257+12c', title: 'The Pulsar of the Dead' },
  { id: 'gj-1214b', issue: 8, name: 'GJ 1214b', title: 'The Boundless Boiling Sea' }
];

function renderPreviewEditionBar(activePlanetId) {
  const bar = document.getElementById('previewEditionBar');
  const chipsContainer = document.getElementById('previewChipsContainer');
  if (!bar || !chipsContainer) return;

  bar.style.display = 'block';
  chipsContainer.innerHTML = '';

  PREVIEW_ISSUES.forEach(item => {
    const chip = document.createElement('button');
    const isActive = item.id === activePlanetId;
    chip.className = `preview-chip-btn ${isActive ? 'active' : ''}`;
    chip.innerHTML = `
      <span class="chip-issue">#00${item.issue}</span>
      <span class="chip-name">${item.name}</span>
    `;
    chip.title = `${item.name} — ${item.title}`;
    chip.onclick = () => {
      soundManager.playScanBeep();
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('preview', 'true');
      newUrl.searchParams.set('planet', item.id);
      window.history.pushState({}, '', newUrl);
      loadDailyPlanet(item.id);
    };
    chipsContainer.appendChild(chip);
  });
}

// Fetch Daily Planet from API / Database (with fallback)
async function loadDailyPlanet(planetIdOverride = null) {
  const searchParams = new URLSearchParams(window.location.search);
  const isPreview = searchParams.get('preview') === 'true';
  const targetPlanet = planetIdOverride || searchParams.get('planet');
  const targetIssue = searchParams.get('issue');

  let url = '/api/today';
  const queryParts = [];
  if (isPreview) queryParts.push('preview=true');
  if (targetPlanet) queryParts.push(`planet=${encodeURIComponent(targetPlanet)}`);
  if (targetIssue) queryParts.push(`issue=${encodeURIComponent(targetIssue)}`);
  if (queryParts.length > 0) url += `?${queryParts.join('&')}`;

  const headers = {};
  if (curatorSessionToken) {
    headers['Authorization'] = `Bearer ${curatorSessionToken}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('API respondeu com status: ' + res.status);
    const data = await res.json();

    // Modo 'Em Breve' (Pré-Estreia Oficial)
    if (data.comingSoon && !isPreview) {
      setupComingSoonView(data);
      return;
    }
    
    if (data.success && data.planet) {
      currentPlanet = data.planet;
      currentPlanet.issueNumber = data.issueNumber || 1;
      currentPlanet.bannerOrientation = data.bannerOrientation || currentPlanet.bannerOrientation || 'vertical';
      currentPlanet.cryptoCertificate = data.cryptoCertificate || null;
      currentPlanet.customArtworkUrl = `/assets/planets/${currentPlanet.id}.jpg${isPreview ? '?preview=true' : ''}`;
    } else {
      throw new Error('Formato inválido retornado pela API');
    }
  } catch (err) {
    console.warn('⚠️ Não foi possível conectar à API de exoplanetas (/api/today). Ativando fallback determinístico local:', err);
    currentPlanet = getDailyExoplanetFallback();
    currentPlanet.customArtworkUrl = `/assets/planets/${currentPlanet.id}.jpg${isPreview ? '?preview=true' : ''}`;
  }

  // Render hero, 3D and details
  await renderHero(currentPlanet);
  renderDossier(currentPlanet);
  await generateAndDisplayPoster(currentPlanet);
  updateMintStatsBanner(currentPlanet.id);

  // Se estiver no modo prévia, renderiza e atualiza a barra de seleção de planetas
  if (isPreview) {
    renderPreviewEditionBar(currentPlanet.id);
  }
}

// Configuração da tela 'Em Breve' (Pré-Estreia)
function setupComingSoonView(data) {
  isComingSoonMode = true;
  const launchDateStr = (data && data.launchDate) || '2026-09-28';
  const [ly, lm, ld] = launchDateStr.split('-').map(Number);
  // 00:00:00 no Horário Oficial de Brasília (UTC-3) corresponde a 03:00:00 UTC
  targetLaunchTimeMs = Date.UTC(ly, lm - 1, ld, 3, 0, 0);

  const comingSoonSection = document.getElementById('comingSoonSection');
  const heroSection = document.getElementById('heroSection');
  const dossierSection = document.querySelector('.dossier-section');
  const viewPosterCallout = document.querySelector('.view-poster-callout');
  const posterLockedSection = document.getElementById('posterLockedSection');
  const posterSection = document.getElementById('posterSection');
  const dailyTimerPill = document.getElementById('dailyTimerPill');
  const currentDateDisplay = document.getElementById('currentDateDisplay');

  if (comingSoonSection) comingSoonSection.style.display = 'block';
  if (heroSection) heroSection.style.display = 'none';
  if (dossierSection) dossierSection.style.display = 'none';
  if (viewPosterCallout) viewPosterCallout.style.display = 'none';
  if (posterLockedSection) posterLockedSection.style.display = 'block';
  if (posterSection) posterSection.style.display = 'none';

  if (currentDateDisplay) {
    currentDateDisplay.textContent = 'PRÉ-ESTREIA • TRANSMISSÃO EM BREVE';
  }

  if (dailyTimerPill) {
    const timerTextSpan = dailyTimerPill.querySelector('span:last-child');
    if (timerTextSpan) {
      timerTextSpan.innerHTML = `Estreia em: <strong id="countdownClock">--:--:--</strong>`;
    }
  }

  // Inscrição rápida dentro do card 'Em Breve'
  const csForm = document.getElementById('csSubscribeForm');
  const csEmail = document.getElementById('csSubscribeEmail');
  const csBtn = document.getElementById('csSubscribeBtn');
  const csFeedback = document.getElementById('csSubscribeFeedback');

  if (csForm && !csForm.dataset.bound) {
    csForm.dataset.bound = 'true';
    csForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = csEmail.value.trim();
      if (!email) return;

      csBtn.disabled = true;
      csBtn.innerHTML = `<span>Processando...</span>`;

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const subData = await res.json();

        csFeedback.style.display = 'block';
        if (subData.success) {
          soundManager.playScanBeep();
          csFeedback.className = 'subscribe-feedback success';
          csFeedback.innerHTML = `✅ ${subData.message}`;
          csEmail.value = '';
        } else {
          soundManager.playHazardAlert();
          csFeedback.className = 'subscribe-feedback error';
          csFeedback.innerHTML = `⚠️ ${subData.error || 'Erro ao processar e-mail.'}`;
        }
      } catch {
        csFeedback.style.display = 'block';
        csFeedback.className = 'subscribe-feedback error';
        csFeedback.innerHTML = `⚠️ Falha ao conectar ao observatório. Tente novamente em instantes.`;
      } finally {
        csBtn.disabled = false;
        csBtn.innerHTML = `<span>Me Avise na Estreia</span><span class="btn-arrow">→</span>`;
      }
    });
  }

  // Botões do pôster bloqueado
  const btnLockedGoToSubscribe = document.getElementById('btnLockedGoToSubscribe');
  if (btnLockedGoToSubscribe) {
    btnLockedGoToSubscribe.onclick = () => {
      const tabSubscribe = document.querySelector('.nav-tab-btn[data-view="subscribe"]');
      if (tabSubscribe) tabSubscribe.click();
    };
  }

  const btnLockedBackToPlanet = document.getElementById('btnLockedBackToPlanet');
  if (btnLockedBackToPlanet) {
    btnLockedBackToPlanet.onclick = () => {
      const tabPlanet = document.querySelector('.nav-tab-btn[data-view="planet"]');
      if (tabPlanet) tabPlanet.click();
    };
  }
}


// Render Hero Section
async function renderHero(planet) {
  heroPlanetName.textContent = planet.name;
  heroPlanetTitle.textContent = planet.title;
  heroPlanetSummary.textContent = planet.summary;
  heroThreatScore.textContent = `💀 ${planet.dangerLevel.toFixed(1)} / 10`;
  heroCategory.textContent = planet.category;
  heroConstellation.textContent = `🌌 Constelação: ${planet.constellation}`;
  heroCoordBadge.textContent = `${planet.constellation.toUpperCase()} • ${planet.distanceLy} LY`;

  heroTemp.textContent = `${planet.tempC.toLocaleString('pt-BR')} °C`;
  heroDistance.textContent = `${planet.distanceLy.toLocaleString('pt-BR')} anos-luz`;
  heroSurvival.textContent = planet.survivalTime;
  heroMass.textContent = `${planet.massVsEarth}x Terra`;

  survivalNarrative.textContent = `Simulação de pouso: Na superfície de ${planet.name}, ${planet.dangerLabel.toLowerCase()}.`;

  // Start 3D Engine in Canvas
  if (!heroRenderer) {
    heroRenderer = new PlanetRenderer(heroCanvas, planet);
  } else {
    heroRenderer.setPlanet(planet);
  }

  // Live NASA Exoplanet Archive TAP API query
  nasaStatusText.textContent = `Consultando NASA Exoplanet Archive para ${planet.name}...`;
  const nasaResult = await fetchNasaExoplanetData(planet.name);

  if (nasaResult.success) {
    const raw = nasaResult.raw;
    nasaStatusText.innerHTML = `✅ <strong>Sincronizado com a NASA:</strong> ${raw.pl_name} | Período Orbital: ${raw.pl_orbper ? raw.pl_orbper.toFixed(2) + ' dias' : 'N/A'}`;
  } else {
    nasaStatusText.innerHTML = `📡 <strong>Base Astronômica Local Ativa:</strong> ${planet.name} (${planet.starType})`;
  }
}

// Render Dossier Section
function renderDossier(planet) {
  dossierSpecsList.innerHTML = `
    <li><span>Distância da Terra:</span> <span>${planet.distanceLy} anos-luz</span></li>
    <li><span>Temperatura da Superfície:</span> <span>${planet.tempC} °C (${planet.tempF} °F)</span></li>
    <li><span>Massa Relativa:</span> <span>${planet.massVsEarth}x a Terra</span></li>
    <li><span>Raio Estimado:</span> <span>${planet.radiusVsEarth}x a Terra</span></li>
    <li><span>Período Orbital (Ano):</span> <span>${planet.orbitalPeriodDays} dias</span></li>
    <li><span>Composição Atmosférica:</span> <span>${planet.atmosphere}</span></li>
    <li><span>Estrela Hospedeira:</span> <span>${planet.starType}</span></li>
    <li><span>Constelação:</span> <span>${planet.constellation}</span></li>
  `;

  dossierHazardTags.innerHTML = '';
  planet.hazardTags.forEach(tag => {
    const span = document.createElement('span');
    span.className = 'hazard-tag';
    span.textContent = `⚠️ ${tag}`;
    dossierHazardTags.appendChild(span);
  });

  dossierDescription.textContent = planet.description;
}

// Generate Comic Poster (A4) and prepare download
async function generateAndDisplayPoster(planet) {
  const orientation = planet.bannerOrientation || 'vertical';
  
  // Update page title and discreet orientation pill
  const posterPageTitle = document.getElementById('posterPageTitle');
  if (posterPageTitle) {
    posterPageTitle.textContent = `PÔSTER • ${planet.name}`;
  }
  if (posterOrientationPill) {
    posterOrientationPill.textContent = (orientation === 'horizontal') ? 'Formato Horizontal' : 'Formato Vertical';
  }
  comicPosterPreviewCard.className = `comic-poster-preview-card ${orientation}`;

  const isPreview = window.location.search.includes('preview=true');
  if (!planet.customArtworkUrl) {
    planet.customArtworkUrl = `/assets/planets/${planet.id}.jpg${isPreview ? '?preview=true' : ''}`;
  }

  if (comicLoadingSpinner) {
    comicLoadingSpinner.style.display = 'block';
    comicLoadingSpinner.innerHTML = `<span class="spinner-dot"></span><p>Renderizando pôster oficial com selos e tipografia...</p>`;
  }
  if (comicPosterImg) comicPosterImg.style.display = 'none';
  if (downloadPosterBtn) downloadPosterBtn.disabled = true;

  try {
    const generator = new ComicBannerGenerator(planet, orientation, planet.cryptoCertificate);
    currentPosterDataUrl = await generator.generatePoster();

    comicLoadingSpinner.style.display = 'none';
    comicPosterImg.src = currentPosterDataUrl;
    comicPosterImg.style.display = 'block';
    downloadPosterBtn.disabled = false;

    // Silently archive in database backend
    archiveBannerInDatabase(planet.id, currentPosterDataUrl);
  } catch (err) {
    console.error('Erro na geração do banner Comic A4:', err);
    comicLoadingSpinner.innerHTML = `<p style="color: var(--accent-red)">Falha ao gerar o pôster em alta resolução.</p>`;
  }
}

// Archive generated banner in backend PostgreSQL/local DB
async function archiveBannerInDatabase(planetId, bannerDataUrl) {
  try {
    await fetch('/api/save-banner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planetId,
        bannerDataUrl
      })
    });
  } catch {
    // Silent catch, client doesn't need to break if offline
  }
}

// Atualiza o banner de estatísticas de tiragem do drop diário
async function updateMintStatsBanner(planetId) {
  const mintNextLabel = document.getElementById('mintNextLabel');
  if (!mintNextLabel || !planetId) return;

  try {
    const res = await fetch(`/api/mint-stats?planet=${encodeURIComponent(planetId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        mintNextLabel.innerHTML = `Próximo Exemplar Oficial: <strong>${data.formattedNextMint}</strong> <span style="opacity: 0.65; font-size: 0.75rem">(${data.totalMints} emitidos)</span>`;
        return;
      }
    }
  } catch {
    // Silencioso em fallback offline
  }

  mintNextLabel.innerHTML = `Próximo Exemplar Oficial: <strong>#0001</strong>`;
}

// Download A4 Poster via Modal de Emissão do Colecionador
function downloadPoster() {
  if (!currentPlanet) return;
  soundManager.playScanBeep();
  if (typeof window.openCollectorMintModal === 'function') {
    window.openCollectorMintModal();
  }
}

// Configuração do Modal de Emissão do Colecionador (Tiragem Numerada)
function setupCollectorMintModal() {
  const modal = document.getElementById('collectorMintModal');
  const closeBtn = document.getElementById('closeMintModalBtn');
  const form = document.getElementById('collectorMintForm');
  const nameInput = document.getElementById('collectorNameInput');
  const submitBtn = document.getElementById('confirmMintBtn');
  const errorMsg = document.getElementById('mintErrorMessage');
  const modalEdition = document.getElementById('modalMintEdition');
  const modalPlanet = document.getElementById('modalMintPlanet');
  const modalTokenHint = document.getElementById('modalTokenHint');

  if (!modal || !form) return;

  async function openModal() {
    if (!currentPlanet) return;
    modal.style.display = 'flex';
    modalPlanet.textContent = currentPlanet.name;
    if (errorMsg) errorMsg.style.display = 'none';

    // Busca próximo número da tiragem em tempo real
    try {
      const res = await fetch(`/api/mint-stats?planet=${encodeURIComponent(currentPlanet.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          modalEdition.textContent = `EXEMPLAR Nº ${data.formattedNextMint}`;
          modalTokenHint.textContent = `Tiragem em andamento: ${data.totalMints} exemplares emitidos para ${currentPlanet.name}. Chave HMAC-SHA256 intransferível.`;
        }
      }
    } catch {
      modalEdition.textContent = 'EXEMPLAR Nº #0001';
      modalTokenHint.textContent = 'Chave Criptográfica HMAC-SHA256 gerada exclusivamente para este download.';
    }

    if (nameInput) {
      nameInput.value = '';
      setTimeout(() => nameInput.focus(), 80);
    }
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentPlanet) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Autenticando & Renderizando 300 DPI...</span>`;
    if (errorMsg) errorMsg.style.display = 'none';

    try {
      const collectorName = nameInput?.value?.trim() || 'Colecionador Oficial';

      // 1. Emite certificado oficial assinado no backend
      const res = await fetch('/api/mint-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planetId: currentPlanet.id,
          collectorName,
          dateStr: currentPlanet.cryptoCertificate?.dateStr
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao emitir exemplar oficial.');
      }

      const certificate = data.certificate;
      const mintNum = data.mintNumber;
      const mintNumStr = String(mintNum).padStart(4, '0');

      // 2. Renderiza o pôster em altíssima definição A4 (300 DPI) com o certificado oficial injetado
      const orientation = currentPlanet.bannerOrientation || 'vertical';
      const generator = new ComicBannerGenerator(currentPlanet, orientation, certificate);
      const mintedPosterDataUrl = await generator.generatePoster();

      // 3. Dispara o download com o nome oficial formatado
      const cleanName = currentPlanet.name.replace(/\s+/g, '-').toUpperCase();
      const link = document.createElement('a');
      link.download = `EXOPLANETA-EXTREMO-${cleanName}-EDICAO-${mintNumStr}-A4.png`;
      link.href = mintedPosterDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Bônus Colecionador: Dispara download da Foto de Telemetria Orbital 3D
      try {
        const photoDataUrl = generateTelemetrySnapshot(currentPlanet, heroRenderer);
        if (photoDataUrl) {
          setTimeout(() => {
            const linkPhoto = document.createElement('a');
            linkPhoto.download = `EXOPLANETA-EXTREMO-${cleanName}-EDICAO-${mintNumStr}-FOTO-3D.png`;
            linkPhoto.href = photoDataUrl;
            document.body.appendChild(linkPhoto);
            linkPhoto.click();
            document.body.removeChild(linkPhoto);
          }, 600);
        }
      } catch (errSnap) {
        console.warn('Falha ao gerar foto de telemetria 3D no download do pôster:', errSnap);
      }

      soundManager.playScanBeep();

      // 4. Atualiza o preview e a barra de tiragem da página
      if (comicPosterImg) comicPosterImg.src = mintedPosterDataUrl;
      updateMintStatsBanner(currentPlanet.id);

      closeModal();
    } catch (err) {
      console.error('Erro na emissão do exemplar:', err);
      if (errorMsg) {
        errorMsg.textContent = err.message || 'Erro ao processar emissão. Tente novamente.';
        errorMsg.style.display = 'block';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Emitir Exemplar & Baixar Pôster</span><span class="btn-arrow">↓</span>`;
    }
  });

  window.openCollectorMintModal = openModal;
}

// Survival Simulator Action
function simulateSurvival() {
  soundManager.playHazardAlert();
  if (!currentPlanet) return;

  alert(
    `🚨 SIMULAÇÃO DE SOBREVIVÊNCIA HUMANA: ${currentPlanet.name.toUpperCase()} 🚨\n\n` +
    `• Tempo Máximo de Vida: ${currentPlanet.survivalTime}\n` +
    `• Causa Mortis: ${currentPlanet.dangerLabel}\n` +
    `• Temperatura do Meio: ${currentPlanet.tempC} °C\n` +
    `• Atmosfera Hostil: ${currentPlanet.atmosphere}\n\n` +
    `Resultado Biológico: Ruptura molecular e falha biológica total e irreversível no primeiro instante de contato.`
  );
}

// Realtime countdown clock to next daily planet drop (midnight 00:00:00 BRT)
function startCountdownTimer() {
  function updateClock() {
    const now = Date.now();
    let diffMs = 0;

    if (isComingSoonMode && targetLaunchTimeMs) {
      diffMs = targetLaunchTimeMs - now;
      if (diffMs <= 0) {
        if (countdownClock) countdownClock.textContent = '00:00:00';
        // Estreia oficial atingida no horário de Brasília!
        if (isComingSoonMode) {
          isComingSoonMode = false;
          setTimeout(() => loadDailyPlanet(), 1200);
        }
        return;
      }
    } else {
      // Meia-noite seguinte no Horário Oficial de Brasília (UTC-3)
      try {
        const nowBrtStr = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }).format(now);
        const [y, m, d] = nowBrtStr.split('-').map(Number);
        // 00:00:00 BRT do dia seguinte equivale a 03:00:00 UTC
        const nextMidnightUtc = Date.UTC(y, m - 1, d + 1, 3, 0, 0);
        diffMs = Math.max(0, nextMidnightUtc - now);
      } catch {
        const midnight = new Date();
        midnight.setHours(24, 0, 0, 0);
        diffMs = Math.max(0, midnight.getTime() - now);
      }
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (countdownClock) {
      countdownClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

// Subscribe Form Action (Tyler Vigen style drop notifications)
function setupSubscribeForm() {
  const form = document.getElementById('subscribeForm');
  const emailInput = document.getElementById('subscribeEmail');
  const submitBtn = document.getElementById('subscribeBtn');
  const feedback = document.getElementById('subscribeFeedback');

  if (!form || !emailInput) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Processando...</span>`;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      feedback.style.display = 'block';
      if (data.success) {
        soundManager.playScanBeep();
        if (data.alreadySubscribed) {
          feedback.className = 'subscribe-feedback already';
          feedback.innerHTML = `ℹ️ ${data.message}`;
        } else {
          feedback.className = 'subscribe-feedback success';
          feedback.innerHTML = `✅ ${data.message}`;
          emailInput.value = '';
        }
      } else {
        soundManager.playHazardAlert();
        feedback.className = 'subscribe-feedback error';
        feedback.innerHTML = `⚠️ ${data.error || 'Erro ao processar e-mail.'}`;
      }
    } catch {
      feedback.style.display = 'block';
      feedback.className = 'subscribe-feedback error';
      feedback.innerHTML = `⚠️ Falha ao conectar ao observatório. Tente novamente em instantes.`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Assinar Alertas</span><span class="btn-arrow">→</span>`;
    }
  });
}

// =============================================================
// Gerenciador de Sessão Segura e Acesso ao Observatório (Vault)
// =============================================================
let curatorSessionToken = sessionStorage.getItem('curator_session') || null;
let curadoriaModule = null;

async function verifyCuratorSession() {
  if (!curatorSessionToken) return false;
  try {
    const res = await fetch('/api/curadoria/verify', {
      headers: { 'Authorization': `Bearer ${curatorSessionToken}` }
    });
    if (!res.ok) {
      curatorSessionToken = null;
      sessionStorage.removeItem('curator_session');
      return false;
    }
    const data = await res.json();
    return !!data.authenticated;
  } catch {
    return false;
  }
}

function mountCuradoriaNavButton() {
  const navTabs = document.querySelector('.header-nav-tabs');
  if (navTabs && !document.getElementById('navTabCuradoria')) {
    const tab = document.createElement('button');
    tab.className = 'nav-tab-btn secret-curator-tab';
    tab.id = 'navTabCuradoria';
    tab.dataset.view = 'curadoria';
    tab.title = 'Painel de Curadoria Semanal do Autor';
    tab.innerHTML = `<span class="tab-icon">🛰️</span><span>Curadoria</span>`;
    tab.style.borderColor = 'rgba(56, 189, 248, 0.5)';
    navTabs.appendChild(tab);
    tab.addEventListener('click', () => {
      if (window.switchTabGlobal) window.switchTabGlobal('curadoria', true);
    });
  }
}

async function handleCuratorLogout() {
  try {
    if (curatorSessionToken) {
      await fetch('/api/curadoria/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${curatorSessionToken}` }
      });
    }
  } catch {}

  curatorSessionToken = null;
  sessionStorage.removeItem('curator_session');

  const tab = document.getElementById('navTabCuradoria');
  if (tab) tab.remove();

  if (curadoriaModule && typeof curadoriaModule.hideCuradoria === 'function') {
    curadoriaModule.hideCuradoria();
  }

  // Volta para a visualização principal
  if (window.switchTabGlobal) {
    window.switchTabGlobal('planet', true);
  }
}

// Modal de Autenticação Segura
function setupAuthModal() {
  const modal = document.getElementById('authModal');
  const closeBtn = document.getElementById('authModalClose');
  const form = document.getElementById('authForm');
  const passwordInput = document.getElementById('authPasswordInput');
  const toggleVisBtn = document.getElementById('authToggleVisibility');
  const errorMsg = document.getElementById('authErrorMessage');
  const submitBtn = document.getElementById('authSubmitBtn');

  function openModal() {
    if (modal) {
      modal.style.display = 'flex';
      if (errorMsg) errorMsg.style.display = 'none';
      if (passwordInput) {
        passwordInput.value = '';
        setTimeout(() => passwordInput.focus(), 100);
      }
    }
  }

  function closeModal() {
    if (modal) modal.style.display = 'none';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (toggleVisBtn && passwordInput) {
    toggleVisBtn.addEventListener('click', () => {
      const isPass = passwordInput.type === 'password';
      passwordInput.type = isPass ? 'text' : 'password';
      toggleVisBtn.textContent = isPass ? '🙈' : '👁️';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = passwordInput.value.trim();
      if (!password) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Autenticando...</span>`;
      if (errorMsg) errorMsg.style.display = 'none';

      try {
        const res = await fetch('/api/curadoria/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Credenciais inválidas.');
        }

        // Armazena sessão do curador
        curatorSessionToken = data.token;
        sessionStorage.setItem('curator_session', data.token);

        closeModal();
        mountCuradoriaNavButton();
        if (window.switchTabGlobal) {
          await window.switchTabGlobal('curadoria', true);
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = `⚠️ ${err.message}`;
          errorMsg.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Acessar Curadoria</span><span class="btn-arrow">→</span>`;
      }
    });
  }

  window.openAuthModal = openModal;
  window.curador = openModal;
  window.curadoria = openModal;

  return { openModal, closeModal };
}

// Tab Navigation (Planeta, Pôster, Inscrever-se e Curadoria privada)
function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const viewSections = {
    planet: document.getElementById('viewPlanet'),
    poster: document.getElementById('viewPoster'),
    subscribe: document.getElementById('viewSubscribe')
  };

  async function switchTab(viewName, updateUrl = true) {
    if (viewName === 'curadoria') {
      const isAuth = await verifyCuratorSession();
      if (!isAuth) {
        if (typeof window.openAuthModal === 'function') {
          window.openAuthModal();
        }
        return;
      }

      mountCuradoriaNavButton();

      // Carregamento preguiçoso (Lazy Loading) do módulo de curadoria
      if (!curadoriaModule) {
        try {
          curadoriaModule = await import('./components/curadoriaModule.js');
        } catch (err) {
          console.error('Falha ao importar curadoriaModule:', err);
        }
      }
      if (curadoriaModule) {
        await curadoriaModule.mountCuradoria({
          token: curatorSessionToken,
          onLogout: handleCuratorLogout
        });
        curadoriaModule.showCuradoria();
      }
    } else {
      if (curadoriaModule && typeof curadoriaModule.hideCuradoria === 'function') {
        curadoriaModule.hideCuradoria();
      }
    }

    if (!viewSections[viewName] && viewName !== 'curadoria') viewName = 'planet';

    // Update active tab buttons
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Toggle view visibility
    Object.entries(viewSections).forEach(([key, el]) => {
      if (el) {
        el.style.display = (key === viewName) ? 'block' : 'none';
      }
    });

    // Resize canvas if switching back to planet view
    if (viewName === 'planet' && heroRenderer) {
      setTimeout(() => heroRenderer.resizeCanvas(), 50);
    }

    if (updateUrl && viewName !== 'curadoria') {
      if (window.location.hash !== `#${viewName}`) {
        history.replaceState(null, '', `#${viewName}`);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  window.switchTabGlobal = switchTab;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.view, true));
  });

  // In-page navigation links
  const btnGoToPoster = document.getElementById('btnGoToPoster');
  if (btnGoToPoster) {
    btnGoToPoster.addEventListener('click', () => switchTab('poster', true));
  }

  const btnBackToPlanet = document.getElementById('btnBackToPlanet');
  if (btnBackToPlanet) {
    btnBackToPlanet.addEventListener('click', () => switchTab('planet', true));
  }

  const btnSubscribeBackToPlanet = document.getElementById('btnSubscribeBackToPlanet');
  if (btnSubscribeBackToPlanet) {
    btnSubscribeBackToPlanet.addEventListener('click', () => switchTab('planet', true));
  }

  // Initial tab navigation from hash
  const initialHash = window.location.hash.replace('#', '').toLowerCase();
  if (initialHash === 'poster') {
    switchTab('poster', false);
  } else if (initialHash === 'subscribe') {
    switchTab('subscribe', false);
  } else {
    switchTab('planet', false);
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (['planet', 'poster', 'subscribe', 'curadoria'].includes(hash)) {
      switchTab(hash, false);
    }
  });
}

// Bind Event Listeners
function bindEvents() {
  simulateSurvivalBtn.addEventListener('click', simulateSurvival);
  downloadPosterBtn.addEventListener('click', downloadPoster);

  const btnSnapshotSensor = document.getElementById('btnSnapshotSensor');
  if (btnSnapshotSensor) {
    btnSnapshotSensor.addEventListener('click', () => {
      if (!currentPlanet || !heroRenderer) return;
      soundManager.playScanBeep();
      const cleanName = currentPlanet.name.replace(/\s+/g, '-').toUpperCase();
      const photoDataUrl = generateTelemetrySnapshot(currentPlanet, heroRenderer);
      if (photoDataUrl) {
        const link = document.createElement('a');
        link.download = `EXOPLANETA-EXTREMO-${cleanName}-FOTO-TELEMETRIA-3D.png`;
        link.href = photoDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  }

  setupCollectorMintModal();
  setupSubscribeForm();
  setupAuthModal();
  setupTabNavigation();

  // Verifica se há token de autenticação passado diretamente pelo comando local (npm run curadoria)
  const urlParams = new URLSearchParams(window.location.search);
  const incomingAuth = urlParams.get('curator_auth') || urlParams.get('auth_token');

  if (incomingAuth) {
    curatorSessionToken = incomingAuth;
    sessionStorage.setItem('curator_session', incomingAuth);
    urlParams.delete('curator_auth');
    urlParams.delete('auth_token');
    const cleanSearch = urlParams.toString() ? `?${urlParams.toString()}` : '';
    history.replaceState(null, '', window.location.pathname + cleanSearch);
  }

  // Se o curador já estiver autenticado (ou acabou de autenticar via comando), monta a aba e abre
  verifyCuratorSession().then(isAuth => {
    if (isAuth) {
      mountCuradoriaNavButton();
      if (incomingAuth || window.location.hash === '#curadoria' || urlParams.has('curador')) {
        if (window.switchTabGlobal) {
          window.switchTabGlobal('curadoria', false);
        }
      }
    } else if (urlParams.has('curador') || window.location.hash === '#curador') {
      if (typeof window.openAuthModal === 'function') {
        window.openAuthModal();
      }
    }
  });

  soundToggleBtn.addEventListener('click', () => {
    const active = soundManager.toggleSound();
    soundIcon.textContent = active ? '🔊' : '🔇';
    soundToggleBtn.classList.toggle('btn-accent', active);
  });
}

// Launch application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

