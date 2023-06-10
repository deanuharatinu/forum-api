const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const Reply = require('../../../Domains/replies/entities/Reply');

describe('RepliesRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist AddReply and return Reply correctly', async () => {
      // Arrange
      /** add user, thread, and comment */
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const { id: commentId } = await CommentsTableTestHelper
        .addComment({ content: 'a content for comment' }, threadId, 'user-123', 'comment-123456');

      const addReply = new AddReply({
        content: 'a content for reply',
      });

      /** create replies repository postgres */
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const result = await replyRepositoryPostgres.addReply(addReply, commentId, 'user-123');

      // Assert
      expect(result).toStrictEqual(new Reply({
        id: 'reply-123',
        content: addReply.content,
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

  describe('findReplyById function', () => {
    it('should throw error when reply is not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => commentRepositoryPostgres.findReplyById('reply-123456'))
        .rejects
        .toThrowError('reply tidak ditemukan');
    });

    it('should throw error when comment is already deleted', async () => {
      // // Arrange
      // await UsersTableTestHelper.addUser({ id: 'user-123' });
      // const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      // const comment = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      // const fakeIdGenerator = () => '123';
      // const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // // Action
      // /** comment is found before delete */
      // await expect(commentRepositoryPostgres.findCommentById(comment.id))
      //   .resolves.not.toThrowError();
      // await commentRepositoryPostgres.deleteCommentById(comment.id);

      // // Assert
      // /** comment is not found after delete */
      // await expect(commentRepositoryPostgres.findCommentById(comment.id))
      //   .rejects
      //   .toThrowError('comment tidak ditemukan');
    });

    it('should return correct Reply object when reply is found', async () => {
      // Arrange
      /** add user, add thread, add comment */
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const { id: commentId } = await CommentsTableTestHelper
        .addComment({ content: 'a content for comment' }, threadId, 'user-123', 'comment-123456');

      const addReply = new AddReply({
        content: 'a content for reply',
      });

      /** create replies repository postgres */
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /** add reply */
      const result = await replyRepositoryPostgres.addReply(addReply, commentId, 'user-123');

      // Action
      const commentResult = await replyRepositoryPostgres.findReplyById(result.id);

      // Assert
      expect(commentResult.owner).toEqual('user-123');
      expect(commentResult.content).toEqual(addReply.content);
    });
  });

  describe('getCommenstByThreadId function', () => {
    it('should throw error when comment there is no comment', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => commentRepositoryPostgres.getCommenstByThreadId('thread-123456'))
        .rejects
        .toThrowError('comment tidak ditemukan');
    });

    it('should return a list of correct CommentDetail object', async () => {
      // Arrange
      /** add user */
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test comment username' });

      /** add 2 threads */
      const threadId1 = await ThreadsTableTestHelper.addNewThread({ id: 'thread1-123', owner: 'user-123' });
      const threadId2 = await ThreadsTableTestHelper.addNewThread({ id: 'thread2-123', owner: 'user-123' });

      /** add 2 comment on first thread */
      const comment1Thread1 = await CommentsTableTestHelper.addComment({ content: 'a content 1 on thread 1' }, threadId1, 'user-123', 'com-1');
      const comment2Thread1 = await CommentsTableTestHelper.addComment({ content: 'a content 2 on thread 2' }, threadId1, 'user-123', 'com2');

      /** add 1 comment on second thread */
      await CommentsTableTestHelper.addComment({ content: 'a content 1 on thread 2' }, threadId2, 'user-123');

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      /** find comments by threadId1 */
      const commentsDetail = await commentRepositoryPostgres.getCommenstByThreadId(threadId1);

      // Assert
      expect(commentsDetail.length).toEqual(2);
      const commentResult1 = commentsDetail[0];
      expect(commentResult1.id).toEqual(comment1Thread1.id);
      expect(commentResult1.username).toEqual('test comment username');
      const commentResult2 = commentsDetail[1];
      expect(commentResult2.id).toEqual(comment2Thread1.id);
      expect(commentResult2.username).toEqual('test comment username');
    });

    it('should return a list of correct order ofCommentDetail objects', async () => {
      // Arrange
      /** add user */
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test comment username' });

      /** add thread */
      const threadId = await ThreadsTableTestHelper.addNewThread({ id: 'thread1-123', owner: 'user-123' });

      /** add 3 comment on first thread */
      const comment1 = await CommentsTableTestHelper.addComment({ content: 'a content 1 on thread 1' }, threadId, 'user-123', 'com-1');
      const comment2 = await CommentsTableTestHelper.addComment({ content: 'a content 2 on thread 2' }, threadId, 'user-123', 'com-2');
      const comment3 = await CommentsTableTestHelper.addComment({ content: 'a content 2 on thread 2' }, threadId, 'user-123', 'com-3');

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      /** find comments by threadId1 */
      const commentsDetail = await commentRepositoryPostgres.getCommenstByThreadId(threadId);

      // Assert
      expect(commentsDetail.length).toEqual(3);
      /** first comment */
      const commentResult1 = commentsDetail[0];
      expect(commentResult1.id).toEqual(comment1.id);
      /** second comment */
      const commentResult2 = commentsDetail[1];
      expect(commentResult2.id).toEqual(comment2.id);
      /** third comment */
      const commentResult3 = commentsDetail[2];
      expect(commentResult3.id).toEqual(comment3.id);
    });
  });
});
