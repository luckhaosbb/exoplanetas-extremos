/**
 * Fallback estático de emergência exclusivo para caso o servidor esteja offline.
 * 
 * MEDIDA DE SEGURANÇA (CWE-200 / Information Disclosure):
 * O catálogo completo de futuros exoplanetas reside exclusivamente no backend (server/data/exoplanets.js).
 * NENHUM planeta futuro é empacotado no bundle do front-end.
 */
export const EMERGENCY_OFFLINE_PLANET = {
  id: 'hd-189733b',
  name: 'HD 189733b',
  title: 'A Chuva Lateral de Vidro Líquido',
  comicHeroTitle: 'THE RAZOR RAIN HORROR',
  category: 'Tempestades Vítreas',
  dangerLevel: 9.8,
  dangerLabel: 'Retalhado por Vento Mach 7 com Vidro Derretido',
  survivalTime: '0.0001 segundos',
  tempC: 930,
  tempF: 1700,
  distanceLy: 64.5,
  constellation: 'Vulpecula (Raposa)',
  massVsEarth: 360.0,
  radiusVsEarth: 12.7,
  orbitalPeriodDays: 2.2,
  atmosphere: 'Silicato de Sódio, Partículas de Vidro, Metano',
  starType: 'Anã Laranja (K1V)',
  hazardTags: ['Chuva de Vidro Líquido', 'Ventos a 8.700 km/h (Mach 7)', 'Tempestade Horizontal'],
  bannerOrientation: 'horizontal',
  comicCatchphrase: 'ON THIS COLD-LOOKING BLUE HELL, THE RAIN DOES NOT FALL... IT CUTS YOU IN HALF AT MACH 7!',
  comicSubtitle: 'A SILICATE NIGHTMARE BEYOND THE STARS!',
  summary: 'Um mundo azul cobalto sereno à distância, mas que esconde o clima mais sádico da galáxia: ventos de 8.700 km/h chicoteiam uma chuva implacável de vidro derretido na horizontal.',
  description: 'Visto pelos telescópios espaciais, HD 189733b exibe um tom azul profundo idêntico ao dos oceanos da Terra. Contudo, essa cor não vem de água, mas sim de nuvens densas repletas de partículas microscópicas de silicato (vidro fundido). Sob temperaturas escaldantes de 930 °C, ventos hipersônicos sete vezes mais rápidos que a velocidade do som impulsionam essas lâminas de vidro na horizontal, triturando qualquer organismo ou blindagem em nanossegundos.',
  visualConfig: {
    primaryColor: '#0055ff',
    secondaryColor: '#00f0ff',
    glowColor: 'rgba(0, 195, 255, 0.85)',
    type: 'glass_storm',
    hasAtmosphere: true,
    atmosphereColor: 'rgba(0, 200, 255, 0.5)',
    particleType: 'glass',
    surfacePattern: 'storm_swirls'
  }
};

export function getDailyExoplanetFallback() {
  return EMERGENCY_OFFLINE_PLANET;
}
