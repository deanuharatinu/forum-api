/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM replies WHERE 1=1');
  },

  async addReply({ content }, commentId, ownerId, id = 'reply-123456') {
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) returning id',
      values: [id, content, false, date, ownerId, commentId],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },

  async findReplyById(replyId) {
    const query = {
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await pool.query(query);

    return result.rows[0];
  },
};

module.exports = RepliesTableTestHelper;
