// Module for fetching live astronomical data from NASA Exoplanet Archive TAP API

const NASA_TAP_ENDPOINT = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';

export async function fetchNasaExoplanetData(planetName) {
  try {
    // Sanitized SQL query for NASA TAP Service
    const query = `select pl_name, hostname, disc_year, pl_orbper, pl_rade, pl_bmasse, pl_eqt, sy_dist from ps where pl_name like '%${planetName}%' and default_flag=1`;
    const url = `${NASA_TAP_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`NASA API returned status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        success: true,
        source: 'NASA Exoplanet Archive (Live TAP API)',
        raw: data[0]
      };
    } else {
      return { success: false, reason: 'No exact record match in TAP database' };
    }
  } catch (error) {
    console.warn(`NASA TAP Query notice for "${planetName}":`, error.message);
    return {
      success: false,
      reason: error.message || 'Network unavailable / CORS / Timeout'
    };
  }
}
