const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const Comment = require('../../../Domains/comments/entities/Comment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
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
      /** comment is found before delete */
      await expect(commentRepositoryPostgres.findCommentById(comment.id))
        .resolves.not.toThrowError();
      await commentRepositoryPostgres.deleteCommentById(comment.id);

      // Assert
      /** comment is not found after delete */
      await expect(commentRepositoryPostgres.findCommentById(comment.id))
        .rejects
        .toThrowError('comment tidak ditemukan');
    });

    it('should throw error when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => commentRepositoryPostgres.deleteCommentById('comment-123456'))
        .rejects
        .toThrowError('comment tidak ditemukan');
    });
  });

  describe('findCommentById function', () => {
    it('should throw error when comment is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => commentRepositoryPostgres.findCommentById('comment-123456'))
        .rejects
        .toThrowError('comment tidak ditemukan');
    });
  });
});
