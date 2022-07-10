import { DataSource } from 'apollo-datasource';
import { Pool } from 'pg';
// import crypto from 'crypto';
import shortid from 'shortid';
import { v4 as uuidv4 } from 'uuid';
import { mainColor } from '../style/colors';
// import { pgSettings } from './encrypted';

// let decrypted;
// if (
//   process.env.NODE_ENV === 'production'
//   && process.env.ENCRYPTION_KEY
//   && process.env.ENCRYPTION_IV
// ) {
//   const decipher = crypto.createDecipheriv(
//     'aes-128-cbc', // algorithm,
//     process.env.ENCRYPTION_KEY,
//     process.env.ENCRYPTION_IV,
//   );
//   let temp = decipher.update(pgSettings, 'base64', 'utf8');
//   temp += decipher.final('utf8');
//   decrypted = JSON.parse(temp);
// }

// const pgConfig = {
//   ssl: decrypted,
// };

// export default new Pool(pgConfig);

export default class PostgresDB extends DataSource {
  pool: Pool;

  constructor(pool: Pool) {
    super();
    this.pool = pool;
  }

  async createPoll(
    owner = null,
    title = 'Default Title',
    description = null,
    options = [],
    color = mainColor,
    randomize = true,
    protection = 'cookie_id',
  ) {
    if (options.length) {
      const id = shortid.generate();
      const text = 'INSERT INTO poll(id, owner_id, title, description, options, color, randomize, protection) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
      const values = [id, owner, title, description, options, color, randomize, protection];
      try {
        const res = await this.pool.query(text, values);
        return res.rows[0];
      } catch (err) {
        console.error(err.stack);
        return null;
      }
    }
    return null;
  }

  async getPoll(id) {
    if (id) {
      const text = 'SELECT poll.*, poll.created_at AS "createdAt", COUNT(DISTINCT vote.id), COUNT(DISTINCT cookie_id) "cookieCount", COUNT(DISTINCT ip) "ipCount", COUNT(DISTINCT user_id) "userCount" FROM poll LEFT JOIN vote ON poll.id = poll_id  WHERE poll.id = $1 GROUP BY poll.id';
      const values = [id];
      try {
        const res = await this.pool.query(text, values);
        return res.rows[0];
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  async vote(
    pollId,
    user = null,
    cookie = null,
    ip = null,
    vote = [],
    lowVote = [],
  ) {
    if (pollId && (vote.length || lowVote.length)) {
      const uuid = uuidv4();
      const text = 'INSERT INTO vote(id, user_id, cookie_id, ip, vote, low_vote, poll_id) VALUES($1, $2, $3, $4, $5, $6, $7)';
      const values = [uuid, user, cookie, ip, vote, lowVote, pollId];
      try {
        await this.pool.query(text, values);
        return true;
      } catch (err) {
        return null;
      }
    }
    return false;
  }

  async getPollResult(
    id,
    protection = 'none',
  ) {
    if (id) {
      let text;
      const values = [id];
      if (protection === 'none') {
        text = 'SELECT vote, low_vote AS "lowVote", COUNT(*) FROM vote WHERE poll_id = $1 GROUP BY vote, "lowVote"';
      } else {
        text = `SELECT *, COUNT(*) FROM (SELECT distinct on (${protection}) vote, low_vote AS "lowVote" FROM vote WHERE poll_id = $1 ORDER BY ${protection}, created_at DESC) sub GROUP BY vote, "lowVote"`;
      }
      try {
        const res = await this.pool.query(text, values);
        return res.rows;
      } catch (err) {
        return null;
      }
    }
    return null;
  }
}
