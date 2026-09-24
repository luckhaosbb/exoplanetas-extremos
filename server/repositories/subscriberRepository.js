import fs from 'fs';
import { getPool, isPostgres, SUBSCRIBERS_PATH } from './database.js';

function readSubscribers() {
  try {
    const raw = fs.readFileSync(SUBSCRIBERS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSubscribers(data) {
  fs.writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const subscriberRepository = {
  async findByEmail(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query('SELECT * FROM subscribers WHERE email = $1 LIMIT 1', [cleanEmail]);
        return res.rows[0] || null;
      } catch (err) {
        console.error('Erro ao consultar assinante no PostgreSQL:', err.message);
      }
    }

    const list = readSubscribers();
    return list.find(s => s.email.toLowerCase() === cleanEmail) || null;
  },

  async save(email) {
    const cleanEmail = email.trim().toLowerCase();

    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          `INSERT INTO subscribers (email)
           VALUES ($1)
           ON CONFLICT (email) DO NOTHING
           RETURNING *`,
          [cleanEmail]
        );
        if (res.rows[0]) {
          return { subscriber: res.rows[0], alreadySubscribed: false };
        }
        return { subscriber: null, alreadySubscribed: true };
      } catch (err) {
        console.error('Erro ao salvar assinante no PostgreSQL:', err.message);
      }
    }

    const list = readSubscribers();
    const existing = list.find(s => s.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { subscriber: existing, alreadySubscribed: true };
    }

    const newSub = {
      id: list.length + 1,
      email: cleanEmail,
      created_at: new Date().toISOString()
    };
    list.push(newSub);
    writeSubscribers(list);
    return { subscriber: newSub, alreadySubscribed: false };
  },

  async count() {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query('SELECT COUNT(*) as total FROM subscribers');
        return parseInt(res.rows[0].total, 10);
      } catch (err) {
        console.error('Erro ao contar assinantes no PostgreSQL:', err.message);
      }
    }

    return readSubscribers().length;
  }
};
