import { DataSource } from 'apollo-datasource';
import shortid from 'shortid';
import { v4 as uuidv4 } from 'uuid';
import Colors from '../style/colors';

export default class PostgresDB extends DataSource {
  constructor({ pool }) {
    super();
    this.pool = pool;
  }

  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  async createPoll(owner = null, title = 'Default Title', description = null, options = [], color = Colors[Object.keys(Colors)[0]], randomize = true, protection = 'cookie_id') {
    if (options.length) {
      const id = shortid.generate();
      const text = 'INSERT INTO poll(id, owner_id, title, description, options, color, randomize, protection) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *';
      const values = [id, owner, title, description, options, color, randomize, protection];
      try {
        const res = await this.pool.query(text, values);
        return res.rows[0];
      } catch (err) {
        console.log(err.stack);
        return null;
      }
    }
    return null;
  }

  async getPoll(id) {
    if (id) {
      const text = 'SELECT poll.*, poll.created_at AS "createdAt", COUNT(*), COUNT(DISTINCT cookie_id) "cookieCount", COUNT(DISTINCT ip) "ipCount", COUNT(DISTINCT user_id) "userCount" FROM poll LEFT JOIN vote ON poll.id = poll_id  WHERE poll.id = $1 GROUP BY poll.id';
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

  async vote(user = null, cookie = null, ip = null, pollId, vote = [], lowVote = []) {
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

  async getPollResult(id, protection = 'none') {
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
