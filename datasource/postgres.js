import { DataSource } from 'apollo-datasource';
import shortid from 'shortid';
import { v4 as uuidv4 } from 'uuid';

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

  async createPoll(owner = null, title = 'Default Title', description = null, options = []) {
    if (options.length) {
      const id = shortid.generate();
      const text = 'INSERT INTO poll(id, owner_id, title, description, options) VALUES($1, $2, $3, $4, $5) RETURNING *';
      const values = [id, owner, title, description, options];
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
      const text = 'SELECT * FROM poll WHERE id = $1';
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

  async vote(user = null, cookie = null, ip = null, pollId, vote = []) {
    if (pollId && vote.length) {
      const uuid = uuidv4();
      const text = 'INSERT INTO vote(id, user_id, cookie_id, ip, vote, poll_id) VALUES($1, $2, $3, $4, $5, $6)';
      const values = [uuid, user, cookie, ip, vote, pollId];
      try {
        await this.pool.query(text, values);
        return true;
      } catch (err) {
        return null;
      }
    }
    return false;
  }

  async getPollResult(id) {
    if (id) {
      const text = 'SELECT vote, COUNT(vote) FROM vote WHERE poll_id = $1 GROUP BY vote';
      const values = [id];
      try {
        const res = await this.pool.query(text, values);
        return res.rows;
      } catch (err) {
        return null;
      }
    }
    return null;
  }

  // getPoll(id) {
  //   return this.knex
  //     .select('*')
  //     .from('poll');
  // }
}
