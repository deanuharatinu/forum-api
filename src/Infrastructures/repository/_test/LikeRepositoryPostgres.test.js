const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('LikeRepositoryPostgres', () => {
  const USER_ID = 'user-123';
  const COMMENT_ID = 'comment-123';

  afterAll(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  beforeEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

    await UsersTableTestHelper.addUser({ id: USER_ID });
    const threadId = await ThreadsTableTestHelper.addNewThread({ owner: USER_ID });
    await CommentsTableTestHelper.addComment({ content: 'a comment' }, threadId, USER_ID, COMMENT_ID);
  });

  describe('addLikeComment function', () => {
    it('should persist like with right comment_id and userid', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await likeRepositoryPostgres.addLikeComment(COMMENT_ID, USER_ID);

      // Assert
      expect(result).not.toBe(undefined);
      expect(result).toEqual('like-123');

      const persistedResult = await LikesTableTestHelper.findLikeCommentById(result);
      expect(persistedResult).not.toBe(undefined);
      expect(persistedResult.id).toEqual(result);
      expect(persistedResult.user_id).toEqual(USER_ID);
      expect(persistedResult.comment_id).toEqual(COMMENT_ID);
    });
  });

  describe('deleteLikeComment function', () => {
    it('should delete like from cache', async () => {
      // Arrange
      const likeId = 'like-123';
      await LikesTableTestHelper.addLikeComment(likeId, COMMENT_ID, USER_ID);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const beforeDeleteResult = await LikesTableTestHelper.findLikeCommentById(likeId);
      expect(beforeDeleteResult).not.toBe(undefined);
      await likeRepositoryPostgres.deleteLikeComment(COMMENT_ID, USER_ID);

      // Assert
      const persistedResult = await LikesTableTestHelper.findLikeCommentById(likeId);
      expect(persistedResult).toBe(undefined);
    });
  });

  describe('verifyLikeAvailability function', () => {
    it('should throw error when like is not found', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(likeRepositoryPostgres.verifyLikeAvailabililty('comment', 'user'))
        .rejects
        .toThrowError(new NotFoundError('like tidak ditemukan'));
    });

    it('should return correct likeId when like is found', async () => {
      // Arrange
      const likeId = 'like-123';
      await LikesTableTestHelper.addLikeComment(likeId, COMMENT_ID, USER_ID);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.verifyLikeAvailabililty(COMMENT_ID, USER_ID);

      expect(result).toEqual(likeId);
    });
  });

  describe('getLikesCountByCommentId function', () => {
    it('should return 0 when there is no likes found', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.getLikesCountByCommentId('');

      // Assert
      expect(result).toBe(0);
    });

    it('should return correct count when likes is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'new-user-123', username: 'john' });
      await LikesTableTestHelper.addLikeComment('like-1', COMMENT_ID, USER_ID);
      await LikesTableTestHelper.addLikeComment('like-2', COMMENT_ID, 'new-user-123');

      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const result = await likeRepositoryPostgres.getLikesCountByCommentId(COMMENT_ID);

      // Assert
      expect(result).toBe(2);
    });
  });
});
