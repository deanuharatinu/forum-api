/* eslint-disable no-promise-executor-return */
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const pool = require('../../database/postgres/pool');
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
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();

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

  describe('getRepliesByCommentId function', () => {
    it('should throw error when there is no reply', async () => {
      // Arrange
      const replyRepository = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => replyRepository.getRepliesByCommentId('reply-123456'))
        .rejects
        .toThrowError('reply tidak ditemukan');
    });

    it('should return a list of correct ReplyDetail object', async () => {
      // Arrange
      /** add user */
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test comment username' });

      /** add thread */
      const threadId = await ThreadsTableTestHelper.addNewThread({ id: 'thread-123', owner: 'user-123' });

      /** add 1 comment on first thread */
      const comment = await CommentsTableTestHelper.addComment({ content: 'a comment' }, threadId, 'user-123', 'com-1');

      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      /** add 2 reply on comment */
      await RepliesTableTestHelper.addReply({ content: 'a reply 1' }, comment.id, 'user-123', 'reply1-1234');
      // delay
      await new Promise((resolve) => setTimeout(resolve, 300));
      await RepliesTableTestHelper.addReply({ content: 'a reply 2' }, comment.id, 'user-123', 'reply2-1234');

      // Action
      /** find reply by commentId */
      const replyDetail = await replyRepository.getRepliesByCommentId(comment.id);

      // Assert
      expect(replyDetail.length).toEqual(2);
      const replyDetail1 = replyDetail[0];
      const replyDetail2 = replyDetail[1];
      expect(replyDetail1.content).toEqual('a reply 1');
      expect(replyDetail1.username).toEqual('test comment username');

      expect(replyDetail2.content).toEqual('a reply 2');
      expect(replyDetail2.username).toEqual('test comment username');
    });

    it('should return a ReplyDetail object with obfuscated content when deleted', async () => {
      // Arrange
      /** add user */
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'test reply username' });

      /** add thread */
      const threadId = await ThreadsTableTestHelper.addNewThread({ id: 'thread-123', owner: 'user-123' });

      /** add comment */
      const comment = await CommentsTableTestHelper.addComment({ content: 'a comment' }, threadId, 'user-123', 'com-1');

      /** add 1 reply */
      const { id: replyId } = await RepliesTableTestHelper.addReply({ content: 'a reply 1' }, comment.id, 'user-123', 'reply-123');

      const fakeIdGenerator = () => '123';
      const replyRepository = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      /** delete reply */
      await replyRepository.deleteReplyById(replyId);
      /** find reply by commentId */
      const replies = await replyRepository.getRepliesByCommentId(comment.id);

      // Assert
      expect(replies.length).toEqual(1);
      const replyDetail = replies[0];
      expect(replyDetail.content).toEqual('**balasan telah dihapus**');
      expect(replyDetail.username).toEqual('test reply username');
    });
  });

  describe('deleteReplyById function', () => {
    it('should delete reply when reply is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const comment = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const reply = await RepliesTableTestHelper.addReply({ content: 'a reply' }, comment.id, 'user-123', 'reply-123456');
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      /** reply is found before delete */
      await expect(replyRepositoryPostgres.findReplyById(reply.id))
        .resolves.not.toThrowError();
      await replyRepositoryPostgres.deleteReplyById(reply.id);

      // Assert
      /** reply is not found after delete */
      await expect(replyRepositoryPostgres.findReplyById(reply.id))
        .rejects
        .toThrowError('reply tidak ditemukan');
    });

    it('should throw error when reply is not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => replyRepositoryPostgres.deleteReplyById('reply-123456'))
        .rejects
        .toThrowError('reply tidak ditemukan');
    });
  });

  describe('findReplyById function', () => {
    it('should throw error when reply is not found', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action and Assert
      await expect(() => replyRepositoryPostgres.findReplyById('reply-123456'))
        .rejects
        .toThrowError('reply tidak ditemukan');
    });

    it('should throw error when reply is already deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const comment = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const reply = await RepliesTableTestHelper.addReply({ content: 'a reply' }, comment.id, 'user-123', 'reply-1234');
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      /** comment is found before delete */
      await expect(replyRepositoryPostgres.findReplyById(reply.id))
        .resolves.not.toThrowError();
      await replyRepositoryPostgres.deleteReplyById(reply.id);

      // Assert
      /** comment is not found after delete */
      await expect(replyRepositoryPostgres.findReplyById(reply.id))
        .rejects
        .toThrowError('reply tidak ditemukan');
    });

    it('should return correct Reply object when reply is found', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const threadId = await ThreadsTableTestHelper.addNewThread({ owner: 'user-123' });
      const { id: commentId } = await CommentsTableTestHelper.addComment({ content: 'a content' }, threadId, 'user-123');
      const reply = await RepliesTableTestHelper.addReply({ content: 'a reply' }, commentId, 'user-123', 'reply-1234');
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const replyResult = await replyRepositoryPostgres.findReplyById(reply.id);

      // Assert
      expect(replyResult.owner).toEqual('user-123');
      expect(replyResult.content).toEqual('a reply');
    });
  });
});
