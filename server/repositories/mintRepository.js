import fs from 'fs';
import { getPool, isPostgres, POSTER_MINTS_PATH } from './database.js';

function readLocalMints() {
  try {
    const raw = fs.readFileSync(POSTER_MINTS_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalMints(data) {
  fs.writeFileSync(POSTER_MINTS_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Mutex de emissão para serializar requisições concorrentes no mesmo planeta/data
const mintLocks = new Map();

function withMintLock(key, fn) {
  const currentPromise = mintLocks.get(key) || Promise.resolve();
  let release;
  const nextPromise = new Promise(resolve => {
    release = resolve;
  });
  mintLocks.set(key, nextPromise);

  return currentPromise
    .then(fn)
    .finally(() => {
      release();
      if (mintLocks.get(key) === nextPromise) {
        mintLocks.delete(key);
      }
    });
}

export const mintRepository = {
  /**
   * Executa uma operação de emissão com garantia de atomicidade (à prova de concorrência)
   * @param {string} planetId
   * @param {string} dateStr
   * @param {Function} operationFn
   */
  async executeAtomicMint(planetId, dateStr, operationFn) {
    const lockKey = `${planetId}:${dateStr}`;
    return withMintLock(lockKey, operationFn);
  },

  /**
   * Obtém o próximo número de exemplar sequencial para um planeta e data específicos
   * @param {string} planetId
   * @param {string} dateStr
   * @returns {Promise<number>}
   */
  async getNextMintNumber(planetId, dateStr) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          'SELECT COALESCE(MAX(mint_number), 0) + 1 AS next_mint FROM poster_mints WHERE planet_id = $1 AND date_str = $2',
          [planetId, dateStr]
        );
        return parseInt(res.rows[0].next_mint, 10);
      } catch (err) {
        console.error('Erro ao consultar próximo número de exemplar no PostgreSQL:', err.message);
      }
    }

    const mints = readLocalMints();
    const planetMints = mints.filter(m => m.planet_id === planetId && m.date_str === dateStr);
    if (planetMints.length === 0) return 1;

    const maxMint = Math.max(...planetMints.map(m => m.mint_number || 0));
    return maxMint + 1;
  },

  /**
   * Salva um novo exemplar oficial de colecionador
   */
  async saveMint({ planetId, dateStr, mintNumber, collectorName, tokenId, signature, serialEntropy, ipHash }) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          `INSERT INTO poster_mints (planet_id, date_str, mint_number, collector_name, token_id, signature, serial_entropy, ip_hash)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (planet_id, date_str, mint_number) DO UPDATE SET collector_name = EXCLUDED.collector_name
           RETURNING *`,
          [planetId, dateStr, mintNumber, collectorName, tokenId, signature, serialEntropy, ipHash]
        );
        if (res.rows[0]) return res.rows[0];
      } catch (err) {
        console.error('Erro ao salvar exemplar no PostgreSQL:', err.message);
      }
    }

    const mints = readLocalMints();
    const newMint = {
      id: mints.length + 1,
      planet_id: planetId,
      date_str: dateStr,
      mint_number: mintNumber,
      collector_name: collectorName,
      token_id: tokenId,
      signature: signature,
      serial_entropy: serialEntropy,
      ip_hash: ipHash,
      created_at: new Date().toISOString()
    };

    mints.push(newMint);
    writeLocalMints(mints);
    return newMint;
  },

  /**
   * Consulta emissões recentes de um mesmo IP para proteção contra spam / rate limit
   */
  async getRecentMintsByIp(planetId, dateStr, ipHash, windowMinutes = 60) {
    const sinceTime = new Date(Date.now() - windowMinutes * 60 * 1000);

    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          `SELECT * FROM poster_mints 
           WHERE planet_id = $1 AND date_str = $2 AND ip_hash = $3 AND created_at >= $4
           ORDER BY created_at DESC`,
          [planetId, dateStr, ipHash, sinceTime.toISOString()]
        );
        return res.rows;
      } catch (err) {
        console.error('Erro ao verificar rate limit no PostgreSQL:', err.message);
      }
    }

    const mints = readLocalMints();
    return mints.filter(m => 
      m.planet_id === planetId &&
      m.date_str === dateStr &&
      m.ip_hash === ipHash &&
      new Date(m.created_at) >= sinceTime
    );
  },

  /**
   * Busca um exemplar pelo Token ID oficial
   */
  async getMintByToken(tokenId) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const res = await pool.query(
          'SELECT * FROM poster_mints WHERE token_id = $1 LIMIT 1',
          [tokenId]
        );
        return res.rows[0] || null;
      } catch (err) {
        console.error('Erro ao buscar token no PostgreSQL:', err.message);
      }
    }

    const mints = readLocalMints();
    return mints.find(m => m.token_id === tokenId) || null;
  },

  /**
   * Obtém estatísticas de tiragem para exibição em tempo real no site
   */
  async getStats(planetId, dateStr) {
    if (isPostgres()) {
      try {
        const pool = getPool();
        const countRes = await pool.query(
          'SELECT COUNT(*) as total, COALESCE(MAX(mint_number), 0) as max_mint FROM poster_mints WHERE planet_id = $1 AND date_str = $2',
          [planetId, dateStr]
        );
        const total = parseInt(countRes.rows[0].total, 10);
        const maxMint = parseInt(countRes.rows[0].max_mint, 10);
        return {
          totalMints: total,
          nextMintNumber: maxMint + 1
        };
      } catch (err) {
        console.error('Erro ao consultar estatísticas de tiragem no PostgreSQL:', err.message);
      }
    }

    const mints = readLocalMints();
    const planetMints = mints.filter(m => m.planet_id === planetId && m.date_str === dateStr);
    const maxMint = planetMints.length > 0 ? Math.max(...planetMints.map(m => m.mint_number || 0)) : 0;

    return {
      totalMints: planetMints.length,
      nextMintNumber: maxMint + 1
    };
  }
};
