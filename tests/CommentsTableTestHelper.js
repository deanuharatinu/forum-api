const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },

  async addComment({ content }, threadId, ownerId, id = 'comment-123456') {
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, content, false, date, ownerId, threadId],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },
};

module.exports = CommentsTableTestHelper;
