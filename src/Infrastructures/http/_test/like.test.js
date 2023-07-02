const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  let server;
  let accessToken;

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
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

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 404 when thread is not found', async () => {
      // Arrange
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-not-found-123/comments/comment-not-found/likes',
        headers: { Authorization: `Bearer ${accessToken}` },
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

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/comment-not-found/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
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
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 200 when comment is found and success add like to comment', async () => {
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

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson).toHaveProperty('status');
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when there is already like on the comment', async () => {
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

      // Action
      /** add like on comment */
      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const likesCountBefore = await LikesTableTestHelper.getLikesCountByCommentId(commentId);

      /** add unlike on comment */
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const likesCountAfter = await LikesTableTestHelper.getLikesCountByCommentId(commentId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson).toHaveProperty('status');
      expect(responseJson.status).toEqual('success');

      expect(likesCountBefore).not.toEqual(likesCountAfter);
      expect(likesCountBefore - 1).toEqual(likesCountAfter);
    });
  });
});
