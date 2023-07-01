const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLikeComment(commentId, userId) {
    const id = `like-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, commentId],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async deleteLikeComment(commentId, userId) {
    const query = {
      text: 'DELETE FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    await this._pool.query(query);
  }

  async verifyLikeAvailabililty(commentId, userId) {
    const query = {
      text: 'SELECT * FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('like tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async getLikesCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = LikeRepositoryPostgres;
