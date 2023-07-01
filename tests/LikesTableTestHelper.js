const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },

  async addLikeComment(id = 'like-123', commentId = 'comment-123', userId = 'user-123') {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await pool.query(query);
  },

  async findLikeCommentById(likeId) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [likeId],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },
};

module.exports = LikesTableTestHelper;
