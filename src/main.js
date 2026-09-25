import './style.css';
import { EXOPLANETS, getDailyExoplanetFallback } from './data/exoplanets.js';
import { PlanetRenderer } from './components/planetRenderer.js';
import { ComicBannerGenerator } from './components/comicBannerGenerator.js';
import { fetchNasaExoplanetData } from './components/nasaApi.js';
import { soundManager } from './components/soundEffects.js';

// Application State
let currentPlanet = null;
let currentPosterDataUrl = null;
let heroRenderer = null;

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

// Fetch Daily Planet from API / Database (with fallback)
async function loadDailyPlanet() {
  const isPreview = window.location.search.includes('preview=true');
  const url = isPreview ? '/api/today?preview=true' : '/api/today';

  try {
    const res = await fetch(url);
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
    } else {
      throw new Error('Formato inválido retornado pela API');
    }
  } catch (err) {
    console.warn('⚠️ Não foi possível conectar à API de exoplanetas (/api/today). Ativando fallback determinístico local:', err);
    currentPlanet = getDailyExoplanetFallback();
  }

  // Render hero, 3D and details
  await renderHero(currentPlanet);
  renderDossier(currentPlanet);
  await generateAndDisplayPoster(currentPlanet);
}

// Configuração da tela 'Em Breve' (Pré-Estreia)
function setupComingSoonView(data) {
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

// Download A4 Poster
function downloadPoster() {
  if (!currentPosterDataUrl || !currentPlanet) return;
  
  soundManager.playScanBeep();
  const link = document.createElement('a');
  const cleanName = currentPlanet.name.replace(/\s+/g, '-').toUpperCase();
  const orientation = (currentPlanet.bannerOrientation || 'vertical').toUpperCase();
  link.download = `EXOPLANETA-EXTREMO-${cleanName}-POSTER-A4-${orientation}.png`;
  link.href = currentPosterDataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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

// Realtime countdown clock to next daily planet drop (midnight 00:00:00)
function startCountdownTimer() {
  function updateClock() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diffMs = midnight - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    countdownClock.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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

// Secret Curator Token for Private Access
const SECRET_CURATOR_TOKEN = 'obs_k7x9m2_luckhaos';

function checkCuratorAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const secretParam = urlParams.get('secret') || urlParams.get('token');
  const hash = window.location.hash;

  if (
    secretParam === SECRET_CURATOR_TOKEN ||
    hash === `#secret=${SECRET_CURATOR_TOKEN}` ||
    hash === `#${SECRET_CURATOR_TOKEN}`
  ) {
    sessionStorage.setItem('curator_token', SECRET_CURATOR_TOKEN);
    return true;
  }
  return sessionStorage.getItem('curator_token') === SECRET_CURATOR_TOKEN;
}

// Tab Navigation (Planeta, Pôster, Inscrever-se, e Vault Secreto se autenticado)
function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const viewSections = {
    planet: document.getElementById('viewPlanet'),
    poster: document.getElementById('viewPoster'),
    subscribe: document.getElementById('viewSubscribe'),
    curadoria: document.getElementById('viewCuradoria')
  };

  function switchTab(viewName, updateUrl = true) {
    if (viewName === 'curadoria') {
      if (!checkCuratorAuth()) {
        viewName = 'planet';
      }
    }

    if (!viewSections[viewName]) viewName = 'planet';

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

    // Se mudou para a curadoria confidencial, carrega a grade e os pôsteres
    if (viewName === 'curadoria') {
      loadCuradoriaDashboard();
    }

    // Keep URL hash in sync only if requested
    if (updateUrl) {
      if (viewName === 'curadoria') {
        if (!window.location.search.includes(SECRET_CURATOR_TOKEN) && !window.location.hash.includes(SECRET_CURATOR_TOKEN)) {
          history.replaceState(null, '', `?secret=${SECRET_CURATOR_TOKEN}`);
        }
      } else {
        if (window.location.hash !== `#${viewName}`) {
          history.replaceState(null, '', `#${viewName}`);
        }
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.view, true));
  });

  // Se o curador estiver autenticado com a chave secreta, monta o botão secreto 'Vault' no header
  if (checkCuratorAuth()) {
    const navTabs = document.querySelector('.header-nav-tabs');
    if (navTabs && !document.getElementById('navTabCuradoria')) {
      const secretTab = document.createElement('button');
      secretTab.className = 'nav-tab-btn secret-curator-tab';
      secretTab.id = 'navTabCuradoria';
      secretTab.dataset.view = 'curadoria';
      secretTab.title = 'Observatório do Autor (Acesso Confidencial)';
      secretTab.innerHTML = `<span class="tab-icon">🛰️</span><span>Vault</span>`;
      secretTab.style.borderColor = 'rgba(255, 60, 0, 0.4)';
      navTabs.appendChild(secretTab);
      secretTab.addEventListener('click', () => switchTab('curadoria', true));
    }
  }

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

  // Initial tab from path or hash:
  const isCurator = checkCuratorAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const secretRequested = urlParams.get('secret') === SECRET_CURATOR_TOKEN || urlParams.get('token') === SECRET_CURATOR_TOKEN || window.location.hash.includes(SECRET_CURATOR_TOKEN);
  const initialHash = window.location.hash.replace('#', '').toLowerCase();

  if (isCurator && secretRequested) {
    if (window.location.hash) {
      history.replaceState(null, '', `?secret=${SECRET_CURATOR_TOKEN}`);
    }
    switchTab('curadoria', false);
  } else if (initialHash === 'poster') {
    switchTab('poster', false);
  } else if (initialHash === 'subscribe') {
    switchTab('subscribe', false);
  } else {
    // Acesso limpo ao domínio (https://exoplanetas.luckhaosbb.dev) -> MANTÉM limpo sem hashes estranhas!
    switchTab('planet', false);
    if (window.location.hash && !window.location.hash.includes(SECRET_CURATOR_TOKEN)) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'curadoria' || hash.includes(SECRET_CURATOR_TOKEN)) {
      if (checkCuratorAuth()) {
        switchTab('curadoria', false);
      } else {
        switchTab('planet', false);
      }
    } else if (['planet', 'poster', 'subscribe'].includes(hash)) {
      switchTab(hash, false);
    } else {
      switchTab('planet', false);
    }
  });
}

// -------------------------------------------------------------
// Painel Confidencial do Autor / Curadoria Semanal
// -------------------------------------------------------------
let curadoriaData = null;
let selectedCuradoriaPlanet = null;
let currentCuradoriaPosterUrl = null;

async function loadCuradoriaDashboard() {
  const grid = document.getElementById('curadoriaWeekGrid');
  if (!grid) return;

  try {
    if (!curadoriaData) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 1.5rem;">Carregando grade confidencial...</div>`;
      const token = sessionStorage.getItem('curator_token') || SECRET_CURATOR_TOKEN;
      const res = await fetch(`/api/curadoria?secret=${encodeURIComponent(token)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success || !data.weekSchedule) throw new Error(data.error || 'Falha ao obter curadoria');
      curadoriaData = data.weekSchedule;
    }

    renderCuradoriaGrid(curadoriaData);

    // Seleciona o primeiro planeta por padrão se nenhum estiver selecionado
    if (!selectedCuradoriaPlanet && curadoriaData.length > 0) {
      selectCuradoriaPlanet(curadoriaData[0]);
    }
  } catch (err) {
    console.error('Erro na curadoria:', err);
    grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--accent-red); padding: 1.5rem;">Acesso confidencial restrito ou falha de conexão.</div>`;
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
  const p = item.planet;

  // Atualiza cabeçalho do stage
  const stageDayBadge = document.getElementById('stageDayBadge');
  const stageIssueBadge = document.getElementById('stageIssueBadge');
  const stageOrientationBadge = document.getElementById('stageOrientationBadge');
  const stagePlanetName = document.getElementById('stagePlanetName');
  const stagePlanetTitle = document.getElementById('stagePlanetTitle');
  const spinner = document.getElementById('curadoriaSpinner');
  const img = document.getElementById('curadoriaPosterImg');
  const downloadBtn = document.getElementById('stageDownloadBtn');

  if (stageDayBadge) stageDayBadge.textContent = `${item.dayName} • ${item.scheduledDate}`;
  if (stageIssueBadge) stageIssueBadge.textContent = item.issueLabel;
  if (stageOrientationBadge) stageOrientationBadge.textContent = p.bannerOrientation === 'horizontal' ? 'Horizontal A4' : 'Vertical A4';
  if (stagePlanetName) stagePlanetName.textContent = p.name;
  if (stagePlanetTitle) stagePlanetTitle.textContent = (p.comicHeroTitle || p.title).toUpperCase();

  if (spinner) spinner.style.display = 'block';
  if (img) img.style.display = 'none';
  if (downloadBtn) downloadBtn.disabled = true;

  try {
    // Renderiza o pôster com prévia rápida instantânea
    const generator = new ComicBannerGenerator(p, p.bannerOrientation);
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

// Bind Event Listeners
function bindEvents() {
  simulateSurvivalBtn.addEventListener('click', simulateSurvival);
  downloadPosterBtn.addEventListener('click', downloadPoster);
  setupSubscribeForm();
  setupTabNavigation();

  soundToggleBtn.addEventListener('click', () => {
    const active = soundManager.toggleSound();
    soundIcon.textContent = active ? '🔊' : '🔇';
    soundToggleBtn.classList.toggle('btn-accent', active);
  });
}

// Launch application when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
