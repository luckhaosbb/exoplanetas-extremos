import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const EXTENDED_PLANETS_PATH = path.join(DATA_DIR, 'extended_planets.json');

const NASA_TAP_ENDPOINT = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

// Exoplanetas extremos de contingência com telemetria já validada pela NASA
export const CURATED_EXTREME_NASA_PLANETS = [
  {
    id: 'corot-7b',
    name: 'CoRoT-7b',
    title: 'O Purgatório Onde Chovem Pedras Derretidas',
    comicHeroTitle: 'THE STONE RAIN PURGATORY',
    category: 'Mundo de Silicato Líquido',
    dangerLevel: 9.8,
    dangerLabel: 'Vaporização e Esmagamento sob Chuva de Rocha Sólida',
    survivalTime: '0.0001 segundos',
    tempC: 2200,
    tempF: 3992,
    distanceLy: 489,
    constellation: 'Monoceros (Unicórnio)',
    massVsEarth: 4.8,
    radiusVsEarth: 1.58,
    orbitalPeriodDays: 0.85,
    atmosphere: 'Vapor Mineral de Silício, Magnésio, Monóxido de Silício',
    starType: 'Anã Laranja (K0V)',
    hazardTags: ['Chuva de Rocha Condensada', 'Oceano de Magma Fervente', 'Ventos Minerais a Mach 5'],
    bannerOrientation: 'vertical',
    comicCatchphrase: 'WHERE CLOUDS OF VAPORIZED MINERALS CONDENSE INTO BOULDERS THAT SMASH THE SURFACE!',
    comicSubtitle: 'A PETRIFIED FIRESTORM IN THE ABYSS!',
    summary: 'Uma super-Terra tão próxima de sua estrela que rochas evaporam na face iluminada, sobem para a estratosfera e despencam como granizo de pedras sólidas incandescentes.',
    description: 'CoRoT-7b completa uma órbita inteira em apenas 20 horas. Na face diurna, as temperaturas atingem 2.200 °C, liquefazendo a crosta em um colossal mar de magma e evaporando minerais. Esses vapores de silício e ferro sobem e encontram o ar mais frio, onde se condensam em pedregulhos sólidos que desabam em tempestades catastróficas de rocha pura.',
    visualConfig: {
      primaryColor: '#ff4400',
      secondaryColor: '#661100',
      glowColor: 'rgba(255, 68, 0, 0.9)',
      type: 'rock_storm',
      hasAtmosphere: true,
      atmosphereColor: 'rgba(200, 50, 0, 0.45)',
      particleType: 'rock_debris',
      surfacePattern: 'magma_veins'
    }
  },
  {
    id: 'toi-849b',
    name: 'TOI-849b',
    title: 'O Coração Desnudo de um Gigante Morto',
    comicHeroTitle: 'THE STRIPPED TITAN',
    category: 'Planeta Ctoniano',
    dangerLevel: 9.9,
    dangerLabel: 'Ruptura Atômica por Gravidade Hiperdensa',
    survivalTime: '0.00003 segundos',
    tempC: 1530,
    tempF: 2786,
    distanceLy: 730,
    constellation: 'Fornax (Fornalha)',
    massVsEarth: 39.1,
    radiusVsEarth: 3.45,
    orbitalPeriodDays: 0.77,
    atmosphere: 'Quase Nula, Vapores Metálicos Remanescentes',
    starType: 'Anã Amarela (G-type)',
    hazardTags: ['Densidade Extrema de Metal Puro', 'Gravidade Monstruosa de 40 Terras', 'Deserto Neptuniano'],
    bannerOrientation: 'horizontal',
    comicCatchphrase: 'THE EXPOSED ROCKY SKELETON OF A DEAD GAS GIANT, ORBITING A STAR IN JUST 18 HOURS!',
    comicSubtitle: 'THE TITAN THAT LOST ITS FLESH!',
    summary: 'Descoberto no misterioso Deserto Neptuniano, TOI-849b é o núcleo rochoso e metálico exposto de um planeta gigante que teve toda a sua atmosfera gasosa arrancada pela fúria de sua estrela.',
    description: 'Com uma massa 40 vezes superior à da Terra concentrada no tamanho de Netuno, TOI-849b é inacreditavelmente denso. Astrônomos acreditam que se tratava de um monstro gasoso comparável a Júpiter que foi despido até os ossos pela fotoevaporação estelar e violentas forças mareais.',
    visualConfig: {
      primaryColor: '#4a69bd',
      secondaryColor: '#e55039',
      glowColor: 'rgba(74, 105, 189, 0.85)',
      type: 'chthonian_core',
      hasAtmosphere: false,
      atmosphereColor: 'rgba(229, 80, 57, 0.3)',
      particleType: 'dense_dust',
      surfacePattern: 'metallic_stripes'
    }
  },
  {
    id: 'kepler-70b',
    name: 'Kepler-70b',
    title: 'O Sobrevivente que Orbitou Dentro de uma Estrela',
    comicHeroTitle: 'THE RESURRECTED ASH',
    category: 'Sobrevivente Pós-Supernova',
    dangerLevel: 10.0,
    dangerLabel: 'Desintegração Térmica em Fornalha Sub-Anã',
    survivalTime: '0.00001 segundos',
    tempC: 6900,
    tempF: 12450,
    distanceLy: 3849,
    constellation: 'Cygnus (Cisne)',
    massVsEarth: 0.44,
    radiusVsEarth: 0.76,
    orbitalPeriodDays: 0.24,
    atmosphere: 'Ausente (Totalmente Despida)',
    starType: 'Sub-anã B (Estrela Pós-Gigante Vermelha)',
    hazardTags: ['Mais Quente que a Superfície do Sol', 'Ano de Apenas 5.7 Horas', 'Mergulhou no Interior Estelar'],
    bannerOrientation: 'vertical',
    comicCatchphrase: 'A WORLD THAT TRAVELLED INSIDE ITS DYING STAR AND LIVED TO TELL THE TALE!',
    comicSubtitle: 'THE BURNING PHOENIX OF THE VOID!',
    summary: 'Mundo carbonizado que foi engolido pelas camadas externas de sua estrela durante a fase de gigante vermelha e conseguiu sobreviver à fornalha estelar.',
    description: 'Kepler-70b completa uma translação inteira a cada 5 horas e 45 minutos. Com temperaturas na face iluminada ultrapassando 6.900 °C — mais quente do que a fotosfera do próprio Sol — a matéria sólida evapora constantemente em feixes de radiação invisível.',
    visualConfig: {
      primaryColor: '#ffffff',
      secondaryColor: '#ff9900',
      glowColor: 'rgba(255, 255, 255, 0.95)',
      type: 'white_furnace',
      hasAtmosphere: false,
      atmosphereColor: 'rgba(255, 150, 0, 0.6)',
      particleType: 'plasma_embers',
      surfacePattern: 'solar_flare'
    }
  },
  {
    id: 'wasp-189b',
    name: 'WASP-189b',
    title: 'O Júpiter com Atmosfera Esculpida em Titânio',
    comicHeroTitle: 'THE TITANIUM TYRANT',
    category: 'Júpiter Ultra-Quente',
    dangerLevel: 9.9,
    dangerLabel: 'Combustão em Atmosfera de Óxidos Metálicos e Titânio',
    survivalTime: '0.00004 segundos',
    tempC: 3200,
    tempF: 5792,
    distanceLy: 322,
    constellation: 'Libra (Balança)',
    massVsEarth: 632.0,
    radiusVsEarth: 18.1,
    orbitalPeriodDays: 2.72,
    atmosphere: 'Vapor de Óxido de Titânio, Ferro, Crômio, Magnésio',
    starType: 'Estrela Tipo-A Quente (HD 133112)',
    hazardTags: ['Camadas Atmosféricas de Titânio', 'Radiação Estelar Assassina', 'Formato Oblato Rápido'],
    bannerOrientation: 'vertical',
    comicCatchphrase: 'WHERE OZONE IS REPLACED BY TITANIUM DIOXIDE IN LAYERS OF INCANDESCENT METAL!',
    comicSubtitle: 'THE METALLIC SKY OF DOOM!',
    summary: 'Um gigante onde telescópios detectaram pela primeira vez camadas atmosféricas complexas compostas inteiramente por gás de titânio ionizado e vapor de ferro.',
    description: 'WASP-189b orbita uma estrela que gira tão depressa que é achatada nos polos. A radiação furiosa mantém o planeta a 3.200 °C. Sua estratosfera possui uma camada de óxido de titânio que absorve a luz estelar da mesma forma que a camada de ozônio da Terra absorve luz UV, criando céus metálicos resplandecentes.',
    visualConfig: {
      primaryColor: '#silver',
      secondaryColor: '#e056fd',
      glowColor: 'rgba(224, 86, 253, 0.85)',
      type: 'titanium_gas',
      hasAtmosphere: true,
      atmosphereColor: 'rgba(224, 86, 253, 0.4)',
      particleType: 'metallic_sparks',
      surfacePattern: 'storm_swirls'
    }
  },
  {
    id: 'k2-141b',
    name: 'K2-141b',
    title: 'O Mundo com Tempestades de Areia Supersônicas',
    comicHeroTitle: 'THE SUPERSONIC GLASS GALE',
    category: 'Mundo de Lava e Rocha',
    dangerLevel: 9.8,
    dangerLabel: 'Retalhamento por Areia Supersônica Mach 4 e Lava',
    survivalTime: '0.00008 segundos',
    tempC: 3000,
    tempF: 5432,
    distanceLy: 202,
    constellation: 'Aquarius (Aquário)',
    massVsEarth: 5.08,
    radiusVsEarth: 1.51,
    orbitalPeriodDays: 0.28,
    atmosphere: 'Vapor de Sódio, Dióxido de Silício, Ferro',
    starType: 'Anã Laranja (K7V)',
    hazardTags: ['Ventos de Rocha a 8.000 km/h', 'Oceano de Magma de 100km de Profundidade', 'Ciclo de Rocha sem Água'],
    bannerOrientation: 'horizontal',
    comicCatchphrase: 'THE WATER CYCLE IS REPLACED BY LIQUID ROCK AND HURRICANES OF LIQUID STONE!',
    comicSubtitle: 'A CRUCIBLE OF CONTINUOUS ROCKFALL!',
    summary: 'Neste planeta o ciclo da água é substituído pelo ciclo da rocha: os oceanos são de magma derretido, a atmosfera é de rocha vaporizada e os ventos de Mach 4 sopram poeira mineral em rotação perpétua.',
    description: 'Com dois terços de sua superfície em dia perpétuo e 3.000 °C de calor, o manto rochoso evaporou para criar uma atmosfera densa de sílica. Os ventos empurram essas rochas vaporizadas a 8.000 km/h para o lado noturno gélido a -200 °C, onde elas precipitam e escorrem de volta como rios de lava.',
    visualConfig: {
      primaryColor: '#eb4d4b',
      secondaryColor: '#f0932b',
      glowColor: 'rgba(235, 77, 75, 0.9)',
      type: 'rock_ocean',
      hasAtmosphere: true,
      atmosphereColor: 'rgba(240, 147, 43, 0.4)',
      particleType: 'magma_sparks',
      surfacePattern: 'tidal_stretch'
    }
  },
  {
    id: 'lhs-3844b',
    name: 'LHS 3844b (Kua’kua)',
    title: 'A Terra Negra Sem Ar Fustigada por Flares',
    comicHeroTitle: 'THE DESOLATE BASALT OBSIDIAN',
    category: 'Deserto de Basalto Negro',
    dangerLevel: 9.6,
    dangerLabel: 'Asfixia no Vácuo e Evisceração por Flares Estelares',
    survivalTime: '0.001 segundos',
    tempC: 770,
    tempF: 1418,
    distanceLy: 48.6,
    constellation: 'Índio (Indus)',
    massVsEarth: 2.25,
    radiusVsEarth: 1.32,
    orbitalPeriodDays: 0.46,
    atmosphere: 'Vácuo Absoluto (Zero Atmosfera)',
    starType: 'Anã Vermelha (M-type)',
    hazardTags: ['Vácuo Cósmico Mortal', 'Superfície de Basalto e Vidro Vulcânico', 'Flares Estelares Frequentes'],
    bannerOrientation: 'vertical',
    comicCatchphrase: 'NO AIR, NO CLOUDS, NO MERCY! BARE OBSIDIAN ROCK SCORCHED BY MONSTROUS STELLAR FLARES!',
    comicSubtitle: 'THE SILENT TOMBSTONE WORLD!',
    summary: 'Uma super-Terra rochosa sem ar algum, cuja superfície de basalto e rocha vulcânica escura reflete a luz como um espelho de obsidiana fria no espaço profundo.',
    description: 'Observações do Telescópio Spitzer revelaram que LHS 3844b não possui atmosfera detectável. O planeta é um monumento silencioso de rochas basálticas escuras e lisas, fustigado continuamente por violentas erupções e ventos estelares de sua anã vermelha hospedeira.',
    visualConfig: {
      primaryColor: '#130f40',
      secondaryColor: '#30336b',
      glowColor: 'rgba(48, 51, 107, 0.8)',
      type: 'dark_basalt',
      hasAtmosphere: false,
      atmosphereColor: 'rgba(19, 15, 64, 0.3)',
      particleType: 'cosmic_dust',
      surfacePattern: 'faint_embers'
    }
  }
];

function readExtendedDb() {
  try {
    if (!fs.existsSync(EXTENDED_PLANETS_PATH)) {
      return {};
    }
    const raw = fs.readFileSync(EXTENDED_PLANETS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeExtendedDb(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(EXTENDED_PLANETS_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao gravar extended_planets.json:', err.message);
  }
}

export const nasaService = {
  /**
   * Obtém planeta pelo ID (procurando na base estendida da NASA)
   */
  getPlanetById(planetId) {
    const extended = readExtendedDb();
    if (extended[planetId]) return extended[planetId];
    return CURATED_EXTREME_NASA_PLANETS.find(p => p.id === planetId) || null;
  },

  /**
   * Salva um planeta enriquecido na base estendida
   */
  savePlanetMetadata(planet) {
    const extended = readExtendedDb();
    extended[planet.id] = planet;
    writeExtendedDb(extended);
    return planet;
  },

  /**
   * Consulta a API TAP da NASA Exoplanet Archive ou utiliza o acervo estendido homologado
   * @param {number} count - Quantidade de planetas necessários
   * @param {string[]} excludeIds - IDs de planetas a desconsiderar (já publicados/agendados)
   * @returns {Promise<Array<object>>}
   */
  async fetchExtremePlanets(count = 6, excludeIds = []) {
    console.log(`📡 [NASA SERVICE] Solicitando ${count} novos exoplanetas extremos via NASA Archive TAP...`);

    const result = [];
    const availableCurated = CURATED_EXTREME_NASA_PLANETS.filter(p => !excludeIds.includes(p.id));

    // 1. Tenta consulta ao vivo à NASA TAP API
    try {
      const query = `select top 15 pl_name, hostname, disc_year, pl_orbper, pl_rade, pl_bmasse, pl_eqt, sy_dist, st_spectype from ps where pl_eqt > 1400 and pl_bmasse is not null and default_flag=1 order by pl_eqt desc`;
      const url = `${NASA_TAP_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const tapData = await res.json();
        console.log(`🌌 [NASA SERVICE] NASA TAP retornou ${tapData.length} registros astronômicos reais.`);

        for (const raw of tapData) {
          if (result.length >= count) break;
          const cleanId = raw.pl_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          if (excludeIds.includes(cleanId) || result.some(p => p.id === cleanId)) continue;

          // Se já existe na lista homologada, usa a versão enriquecida completa
          const curated = CURATED_EXTREME_NASA_PLANETS.find(p => p.name.toLowerCase() === raw.pl_name.toLowerCase() || p.id === cleanId);
          if (curated) {
            result.push(curated);
            this.savePlanetMetadata(curated);
            continue;
          }

          // Caso contrário, enriquece dinamicamente os parâmetros da NASA
          const enriched = this.enrichNasaRawPlanet(raw);
          result.push(enriched);
          this.savePlanetMetadata(enriched);
        }
      }
    } catch (err) {
      console.warn('⚠️ [NASA SERVICE] Oscilação na API externa da NASA:', err.message, '-> Ativando acervo estendido homologado.');
    }

    // 2. Se a API externa não completou a cota solicitada, completa com o acervo homologado da NASA
    for (const curated of availableCurated) {
      if (result.length >= count) break;
      if (!result.some(p => p.id === curated.id)) {
        result.push(curated);
        this.savePlanetMetadata(curated);
      }
    }

    console.log(`✅ [NASA SERVICE] ${result.length} exoplanetas extremos selecionados e prontos para agendamento.`);
    return result;
  },

  /**
   * Converte registro cru da NASA em formato de quadrinhos cósmico
   */
  enrichNasaRawPlanet(raw) {
    const cleanId = raw.pl_name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tempC = raw.pl_eqt ? Math.round(raw.pl_eqt - 273.15) : 1800;
    const tempF = Math.round(tempC * 9 / 5 + 32);
    const distLy = raw.sy_dist ? Math.round(raw.sy_dist * 3.26156) : 500;
    const mass = raw.pl_bmasse ? Number(raw.pl_bmasse.toFixed(1)) : 100.0;
    const radius = raw.pl_rade ? Number(raw.pl_rade.toFixed(1)) : 10.0;
    const period = raw.pl_orbper ? Number(raw.pl_orbper.toFixed(2)) : 1.2;

    const comicHeroTitle = `THE SCORCHED CHURN OF ${raw.pl_name.toUpperCase()}`;

    return {
      id: cleanId,
      name: raw.pl_name,
      title: `O Titã de Fogo Descoberto pela NASA (${raw.pl_name})`,
      comicHeroTitle,
      category: 'Inferno Cósmico Extremo',
      dangerLevel: 9.9,
      dangerLabel: 'Vaporização por Radiação Térmica Superaquecida',
      survivalTime: '0.00005 segundos',
      tempC,
      tempF,
      distanceLy: distLy,
      constellation: 'Espaço Profundo (NASA Archive)',
      massVsEarth: mass,
      radiusVsEarth: radius,
      orbitalPeriodDays: period,
      atmosphere: 'Vapor de Ferro, Silicato Incandescente, Hélio',
      starType: raw.st_spectype || raw.hostname || 'Estrela Extrema',
      hazardTags: [`Calor Extremo de ${tempC}°C`, 'Ventos Térmicos Relativísticos', 'Radiação Selvagem'],
      bannerOrientation: 'vertical',
      comicCatchphrase: `A COSMIC FURNACE BURNING AT ${tempC} DEGREES CELSIUS IN THE DEPTHS OF THE GALAXY!`,
      comicSubtitle: 'RECORDED BY THE NASA EXOPLANET ARCHIVE!',
      summary: `Mundo extremo descoberto em ${raw.disc_year || 'missão recente'}. Com temperaturas de ${tempC} °C, orbita sua estrela hospedeira em meros ${period} dias.`,
      description: `Catalogado pelo NASA Exoplanet Archive sob identificador oficial ${raw.pl_name}. Situado a ${distLy} anos-luz da Terra, possui massa equivalente a ${mass} Terras e orbita em regime de acoplamento mareal extremo.`,
      visualConfig: {
        primaryColor: '#ff3f34',
        secondaryColor: '#ffa801',
        glowColor: 'rgba(255, 63, 52, 0.9)',
        type: 'ultra_hot',
        hasAtmosphere: true,
        atmosphereColor: 'rgba(255, 168, 1, 0.45)',
        particleType: 'plasma_embers',
        surfacePattern: 'solar_flare'
      }
    };
  }
};
