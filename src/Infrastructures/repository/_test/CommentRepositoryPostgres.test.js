/* eslint-disable no-promise-executor-return */
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepository postgres', () => {
  beforeEach(async () => {
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

  describe('addComment function', () => {
    it('should persist Add Comment and return Comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({
        content: 'a content',
      });
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await commentRepositoryPostgres.addComment(addComment, threadId, 'user-123');

      // Assert
      expect(result).toStrictEqual(new Comment({
        id: 'comment-123',
        content: addComment.content,
        owner: 'user-123',
      }));
      const persistedResult = await CommentsTableTestHelper.findCommentById(result.id);
      expect(persistedResult).not.toBe(undefined);
      expect(persistedResult.id).toEqual(result.id);
      expect(persistedResult.content).toEqual(result.content);
      expect(persistedResult.owner).toEqual(result.owner);
    });
  });

  describe('deleteCommentById function', () => {
    it('should delete comment when comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const comment = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteCommentById(comment.id);

      // Assert
      const persistedResult = await CommentsTableTestHelper.findCommentById(comment.id);
      expect(persistedResult).not.toBe(undefined);
      expect(persistedResult.is_deleted).toEqual(true);
    });
  });

  describe('findCommentById function', () => {
    it('should return correct Comment object when comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const { id: commentId } = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const commentResult = await commentRepositoryPostgres.findCommentById(commentId);

      // Assert
      expect(commentResult.id).toEqual(commentId);
      expect(commentResult.owner).toEqual('user-123');
      expect(commentResult.content).toEqual('a content');
    });

    it('should return obfuscated content of Comment object when comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const { id: commentId } = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteCommentById(commentId);
      const commentResult = await commentRepositoryPostgres.findCommentById(commentId);

      // Assert
      expect(commentResult.id).toEqual(commentId);
      expect(commentResult.owner).toEqual('user-123');
      expect(commentResult.content).toEqual('**komentar telah dihapus**');
      expect(commentResult).toStrictEqual(new Comment({
        id: commentId,
        content: '**komentar telah dihapus**',
        owner: 'user-123',
      }));
    });

    it('should return obfuscated content of Comment object when comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const { id: commentId } = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const commentResult = await commentRepositoryPostgres.findCommentById(commentId);

      // Assert
      expect(commentResult.id).toEqual(commentId);
      expect(commentResult.owner).toEqual('user-123');
      expect(commentResult.content).toEqual('a content');
      expect(commentResult).toStrictEqual(new Comment({
        id: commentId,
        content: 'a content',
        owner: 'user-123',
      }));
    });

    it('should throw error when comment is not found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Assert and Action
      await expect(commentRepositoryPostgres.findCommentById('comment-123'))
        .rejects
        .toThrowError(new NotFoundError('comment tidak ditemukan'));
    });
  });

  describe('getCommenstByTgetCommentsByThreadIdhreadId function', () => {
    it('should return empy list when there is no comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const result = await commentRepositoryPostgres.getCommentsByThreadId('thread-123456');

      // Assert
      expect(result).toStrictEqual([]);
    });

    it('should return a list of correct CommentDetail object', async () => {
      // Arrange
      await RepliesTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
      /** add user */
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test comment username' });

      /** add 2 threads */
      const threadId1 = await ThreadsTableTestHelper.addNewThread({ id: 'thread1-123', owner: 'user-123' });
      const threadId2 = await ThreadsTableTestHelper.addNewThread({ id: 'thread2-123', owner: 'user-123' });

      /** add 2 comment on first thread */
      const comment1Thread1 = await CommentsTableTestHelper.addComment({ content: 'a content 1 on thread 1' }, threadId1, 'user-123', 'com-1');
      // delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const comment2Thread1 = await CommentsTableTestHelper.addComment({ content: 'a content 2 on thread 1' }, threadId1, 'user-123', 'com-2');
      // delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      /** add 1 comment on second thread */
      await CommentsTableTestHelper.addComment({ content: 'a content 1 on thread 2' }, threadId2, 'user-123');

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      /** find comments by threadId1 */
      const commentsDetail = await commentRepositoryPostgres.getCommentsByThreadId(threadId1);

      // Assert
      expect(commentsDetail.length).toEqual(2);
      const commentResult1 = commentsDetail[0];
      const commentResult2 = commentsDetail[1];

      expect(commentResult1.id).toEqual(comment1Thread1.id);
      expect(commentResult1.content).toEqual('a content 1 on thread 1');
      expect(commentResult1.username).toEqual('test comment username');

      expect(commentResult2.id).toEqual(comment2Thread1.id);
      expect(commentResult2.content).toEqual('a content 2 on thread 1');
      expect(commentResult2.username).toEqual('test comment username');
    });

    it('should return a list of correct order ofCommentDetail objects', async () => {
      // Arrange
      /** add user */
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test comment username' });

      /** add thread */
      const threadId = await ThreadsTableTestHelper.addNewThread({ id: 'thread1-123', owner: 'user-123' });

      /** add 3 comment on first thread */
      const comment1 = await CommentsTableTestHelper.addComment({ content: 'a content 1 on thread 1' }, threadId, 'user-123', 'com-3');
      // delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const comment2 = await CommentsTableTestHelper.addComment({ content: 'a content 2 on thread 1' }, threadId, 'user-123', 'com-4');
      // delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      const comment3 = await CommentsTableTestHelper.addComment({ content: 'a content 3 on thread 1' }, threadId, 'user-123', 'com-5');

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      /** find comments by threadId1 */
      const commentsDetail = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      // Assert
      expect(commentsDetail.length).toEqual(3);
      const commentResult1 = commentsDetail[0];
      const commentResult2 = commentsDetail[1];
      const commentResult3 = commentsDetail[2];

      /** first comment */
      expect(commentResult1.id).toEqual(comment1.id);
      expect(commentResult1.content).toEqual('a content 1 on thread 1');

      /** second comment */
      expect(commentResult2.id).toEqual(comment2.id);
      expect(commentResult2.content).toEqual('a content 2 on thread 1');

      /** third comment */
      expect(commentResult3.id).toEqual(comment3.id);
      expect(commentResult3.content).toEqual('a content 3 on thread 1');
    });
  });

  describe('verifyCommentAvailabilityById function', () => {
    it('should throw error when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => commentRepositoryPostgres.verifyCommentAvailabilityById('comment-123456'))
        .rejects
        .toThrowError('comment tidak ditemukan');
    });

    it('should return correct Comment object even when comment is already deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const comment = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.deleteCommentById(comment.id);
      const result = await commentRepositoryPostgres.verifyCommentAvailabilityById(comment.id);

      // Assert
      expect(result).toStrictEqual(new Comment({
        id: comment.id,
        content: '**komentar telah dihapus**',
        owner: 'user-123',
      }));
    });

    it('should return correct Comment object when comment is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const { id: commentId } = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const commentResult = await commentRepositoryPostgres
        .verifyCommentAvailabilityById(commentId);

      // Assert
      expect(commentResult.id).toEqual(commentId);
      expect(commentResult.owner).toEqual('user-123');
      expect(commentResult.content).toEqual('a content');
    });
  });
});
