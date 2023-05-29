const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const Thread = require('../../../Domains/threads/entities/Thread');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addNewThread function', () => {
    it('should persist New Thread and return Thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({ title: 'a title', body: 'a body' });
      const expectedOwner = 'user-123';
      await UsersTableTestHelper.addUser({ id: expectedOwner });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const thread = await threadRepositoryPostgres.addNewThread(newThread, expectedOwner);

      // Assert
      expect(thread).toStrictEqual(new Thread({
        id: 'thread-123',
        title: newThread.title,
        owner: expectedOwner,
      }));
    });
  });
});
