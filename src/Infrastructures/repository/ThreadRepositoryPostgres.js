const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const Thread = require('../../Domains/threads/entities/Thread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addNewThread({ title, body }, ownerId) {
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, ownerId],
    };

    const result = await this._pool.query(query);

    return new Thread(result.rows[0]);
  }

  async verifyThreadById(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('thread tidak ditemukan');
    }

    return result.rows[0].id;
  }
}

module.exports = ThreadRepositoryPostgres;
