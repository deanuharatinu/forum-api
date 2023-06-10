const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/reply endpoint', () => {
  let server;
  let accessToken;

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  beforeEach(async () => {
    // Arrange
    server = await createServer(container);

    // add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });

    // login
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });

    const loginResponseJson = JSON.parse(loginResponse.payload);
    accessToken = loginResponseJson.data.accessToken;
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/reply', () => {
    it('should response 404 when thread is not found', async () => {
      // Arrange
      const replyPayload = {
        content: 'a reply content',
      };

      // Arrange and Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-not-found-123/comments/comment-not-found/replies',
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: replyPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toHaveProperty('status');
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when comment is not found', async () => {
      // Arrange
      /** add a thread */
      const threadPayload = {
        title: 'This is a title',
        body: 'This is a body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: threadPayload,
      });
      const threadJson = JSON.parse(threadResponse.payload);
      const threadId = threadJson.data.addedThread.id;

      const replyPayload = {
        content: 'a reply content',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/comment-not-found/replies`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: replyPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toHaveProperty('status');
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 401 when missing authentication', async () => {
      // Arrange and Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when given invalid body', async () => {
      // Arrange
      /** add a thread */
      const threadPayload = {
        title: 'This is a title',
        body: 'This is a body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: threadPayload,
      });
      const threadJson = JSON.parse(threadResponse.payload);
      const threadId = threadJson.data.addedThread.id;

      /** add comment */
      const commentPayload = {
        content: 'this is a content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: commentPayload,
      });
      const commentJson = JSON.parse(commentResponse.payload);
      const commentId = commentJson.data.addedComment.id;

      const invalidPayload = {
        content: 123123,
      };

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: invalidPayload,
      });

      // Assert
      const replyJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(400);
      expect(replyJson.status).toEqual('fail');
      expect(replyJson.message).toEqual('content harus string');
    });

    it('should response 201 with a valid payload', async () => {
      // Arrange
      /** add a thread */
      const threadPayload = {
        title: 'This is a title',
        body: 'This is a body',
      };

      const threadResponse = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: threadPayload,
      });
      const threadJson = JSON.parse(threadResponse.payload);
      const threadId = threadJson.data.addedThread.id;

      /** add comment */
      const commentPayload = {
        content: 'this is a content',
      };

      const commentResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: commentPayload,
      });
      const commentJson = JSON.parse(commentResponse.payload);
      const commentId = commentJson.data.addedComment.id;

      const validPayload = {
        content: 'replying',
      };

      // Action
      const replyResponse = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: validPayload,
      });

      // Assert
      const replyJson = JSON.parse(replyResponse.payload);
      expect(replyResponse.statusCode).toEqual(201);
      expect(replyJson.status).toEqual('success');
      expect(replyJson).toHaveProperty('data');
      expect(replyJson.data).toHaveProperty('addedReply');
      expect(replyJson.data.addedReply).toBeInstanceOf(Object);
      expect(replyJson.data.addedReply).toHaveProperty('id');
      expect(replyJson.data.addedReply.id).not.toBeUndefined();
      expect(replyJson.data.addedReply).toHaveProperty('content');
      expect(replyJson.data.addedReply.content).toEqual(validPayload.content);
      expect(replyJson.data.addedReply).toHaveProperty('owner');
      expect(replyJson.data.addedReply.owner).not.toBeUndefined();
    });
  });
});
