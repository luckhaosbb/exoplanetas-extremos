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
  }
};
