const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const Reply = require('../../Domains/replies/entities/Reply');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply, commentId, ownerId) {
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const { content } = addReply;

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, content, false, date, ownerId, commentId],
    };

    const result = await this._pool.query(query);

    return new Reply(result.rows[0]);
  }

  async deleteReplyById(replyId) {
    throw new Error('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async findReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('reply tidak ditemukan');
    }

    return new Reply(result.rows[0]);
  }

  async getRepliesByCommentId(commentId) {
    const query = {
      text: `SELECT * FROM replies AS r
            LEFT JOIN users AS u ON r.owner = u.id
            WHERE r.comment_id = $1 ORDER BY r.date ASC`,
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('reply tidak ditemukan');
    }

    return result.rows.map((payload) => new ReplyDetail(payload));
  }
}

module.exports = ReplyRepositoryPostgres;
