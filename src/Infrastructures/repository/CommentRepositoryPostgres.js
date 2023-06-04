const CommentRepository = require('../../Domains/comments/CommentRepository');
const Comment = require('../../Domains/comments/entities/Comment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment, threadId, ownerId) {
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, addComment.content, false, date, ownerId, threadId],
    };

    const result = await this._pool.query(query);

    return new Comment(result.rows[0]);
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_deleted = $1 WHERE id = $2 RETURNING id, is_deleted',
      values: [true, commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('comment tidak ditemukan');
    }
  }

  async findCommentById(commentId) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('comment tidak ditemukan');
    }

    const { is_deleted: isDeleted } = result.rows[0];
    if (isDeleted) {
      throw new Error('comment tidak ditemukan');
    }

    return new Comment(result.rows[0]);
  }
}

module.exports = CommentRepositoryPostgres;