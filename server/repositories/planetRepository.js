import fs from 'fs';
import { getPool, isPostgres, LOCAL_DB_PATH } from './database.js';

function readLocalDb() {
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalDb(data) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const planetRepository = {
  async getByDate(dateStr) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          'SELECT * FROM published_planets WHERE published_date = $1 LIMIT 1',
          [dateStr]
        );
        return res.rows[0] || null;
      } catch (err) {
        console.error('Erro ao consultar planeta por data no PostgreSQL:', err.message);
      }
    }

    const list = readLocalDb();
    return list.find(item => item.published_date === dateStr) || null;
  },

  async getAllPublishedIds() {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query('SELECT planet_id FROM published_planets');
        return res.rows.map(r => r.planet_id);
      } catch (err) {
        console.error('Erro ao consultar IDs de planetas no PostgreSQL:', err.message);
      }
    }

    const list = readLocalDb();
    return list.map(item => item.planet_id);
  },

  async getOfficiallyReleasedPlanetIds(currentDateStr) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          'SELECT planet_id FROM published_planets WHERE published_date <= $1',
          [currentDateStr]
        );
        return res.rows.map(r => r.planet_id);
      } catch (err) {
        console.error('Erro ao consultar planetas liberados no PostgreSQL:', err.message);
      }
    }

    const list = readLocalDb();
    return list
      .filter(item => item.published_date <= currentDateStr)
      .map(item => item.planet_id);
  },

  async getAllRecords() {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query('SELECT * FROM published_planets ORDER BY published_date ASC');
        return res.rows;
      } catch (err) {
        console.error('Erro ao consultar todos os registros no PostgreSQL:', err.message);
      }
    }

    const list = readLocalDb();
    return [...list].sort((a, b) => a.published_date.localeCompare(b.published_date));
  },

  async save({ planetId, planetName, dateStr, bannerOrientation = 'vertical', bannerData = null }) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          `INSERT INTO published_planets (planet_id, planet_name, published_date, banner_orientation, banner_data)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (published_date) DO NOTHING
           RETURNING *`,
          [planetId, planetName, dateStr, bannerOrientation, bannerData]
        );
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.error('Erro ao salvar planeta no PostgreSQL:', err.message);
      }
    }

    const list = readLocalDb();
    const existing = list.find(item => item.published_date === dateStr);
    if (!existing) {
      const newItem = {
        id: list.length + 1,
        planet_id: planetId,
        planet_name: planetName,
        published_date: dateStr,
        banner_orientation: bannerOrientation,
        banner_data: bannerData,
        created_at: new Date().toISOString()
      };
      list.push(newItem);
      writeLocalDb(list);
      return newItem;
    }
    return existing;
  },

  async updateBanner(dateStr, bannerData) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        await pool.query(
          'UPDATE published_planets SET banner_data = $1 WHERE published_date = $2',
          [bannerData, dateStr]
        );
        return true;
      } catch (err) {
        console.error('Erro ao atualizar banner no PostgreSQL:', err.message);
      }
    }

    const list = readLocalDb();
    const item = list.find(p => p.published_date === dateStr);
    if (item) {
      item.banner_data = bannerData;
      writeLocalDb(list);
      return true;
    }
    return false;
  },

  async count() {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query('SELECT COUNT(*) as total FROM published_planets');
        return parseInt(res.rows[0].total, 10);
      } catch (err) {
        console.error('Erro ao contar planetas no PostgreSQL:', err.message);
      }
    }

    return readLocalDb().length;
  },

  async clearAll() {
    if (isPostgres()) {
      try {
        const pool = getPool();
        await pool.query('TRUNCATE TABLE published_planets RESTART IDENTITY CASCADE');
        return true;
      } catch (err) {
        console.error('Erro ao limpar planetas no PostgreSQL:', err.message);
      }
    }

    writeLocalDb([]);
    return true;
  },

  async seedDefaultPlanets() {
    const defaultPlanets = [
      { planetId: 'hd-189733b', planetName: 'HD 189733b', dateStr: '2026-09-28', bannerOrientation: 'horizontal' },
      { planetId: 'kelt-9b', planetName: 'KELT-9b', dateStr: '2026-09-29', bannerOrientation: 'vertical' },
      { planetId: 'wasp-76b', planetName: 'WASP-76b', dateStr: '2026-09-30', bannerOrientation: 'vertical' },
      { planetId: 'tres-2b', planetName: 'TrES-2b', dateStr: '2026-10-01', bannerOrientation: 'vertical' },
      { planetId: 'wasp-12b', planetName: 'WASP-12b', dateStr: '2026-10-02', bannerOrientation: 'horizontal' },
      { planetId: '55-cancri-e', planetName: '55 Cancri e (Janssen)', dateStr: '2026-10-03', bannerOrientation: 'vertical' },
      { planetId: 'psr-b1257-12c', planetName: 'PSR B1257+12c (Poltergeist)', dateStr: '2026-10-04', bannerOrientation: 'vertical' },
      { planetId: 'gj-1214b', planetName: 'GJ 1214b', dateStr: '2026-10-05', bannerOrientation: 'horizontal' }
    ];

    const currentCount = await this.count();
    if (currentCount < 8) {
      console.log('🪐 [DATABASE SEED] Inicializando grade homologada dos 8 primeiros exoplanetas...');
      for (const p of defaultPlanets) {
        await this.save(p);
      }
      console.log('✅ [DATABASE SEED] Grade oficial de 8 exoplanetas garantida no banco de dados.');
    }
  }
};
