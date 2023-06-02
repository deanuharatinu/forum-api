const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
};

module.exports = CommentsTableTestHelper;
