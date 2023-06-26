const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const Thread = require('../../../Domains/threads/entities/Thread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepository postgres', () => {
  beforeAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

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
      const result = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(result).not.toBe(undefined);
      expect(result.id).toEqual('thread-123');
    });
  });

  describe('verifyThreadAvailabilityById function', () => {
    it('should throw error when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.verifyThreadAvailabilityById(''))
        .rejects
        .toThrowError('thread tidak ditemukan');
    });

    it('should return threadId correctly', async () => {
      // Arrange
      const newThread = new NewThread({ title: 'a title', body: 'a body' });
      const expectedOwner = 'user-123';
      await UsersTableTestHelper.addUser({ id: expectedOwner });
      const fakeIdGenerator = () => '123';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const thread = await threadRepositoryPostgres.addNewThread(newThread, expectedOwner);

      // Action
      const threadId = await threadRepositoryPostgres.verifyThreadAvailabilityById(thread.id);
      expect(threadId).toEqual(thread.id);
    });
  });

  describe('getThreadDetailByThreadId function', () => {
    it('should throw error when thread is not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(threadRepositoryPostgres.getThreadDetailByThreadId(''))
        .rejects
        .toThrowError(new NotFoundError('thread tidak ditemukan'));
    });

    it('should return ThreadWithoutComments object correctly', async () => {
      // Arrange
      const newThread = new NewThread({ title: 'a title', body: 'a body' });
      await UsersTableTestHelper.addUser({ id: 'user-123' });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const thread = await threadRepositoryPostgres.addNewThread(newThread, 'user-123');

      // Action
      const threadDetailWithoutComments = await threadRepositoryPostgres
        .getThreadDetailByThreadId(thread.id);
      expect(threadDetailWithoutComments.id).toEqual(thread.id);
      expect(threadDetailWithoutComments.title).toEqual(newThread.title);
      expect(threadDetailWithoutComments.body).toEqual(newThread.body);
    });
  });
});
