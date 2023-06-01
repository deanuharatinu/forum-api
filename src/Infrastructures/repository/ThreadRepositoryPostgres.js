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

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4) RETURNING id, title, owner',
      values: [id, title, body, ownerId],
    };

    const result = await this._pool.query(query);

    return new Thread(result.rows[0]);
  }
}

module.exports = ThreadRepositoryPostgres;
