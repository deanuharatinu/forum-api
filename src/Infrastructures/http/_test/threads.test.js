const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoint', () => {
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

  describe('when POST /threads', () => {
    it('should response 401 when missing authentication ', async () => {
      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when given invalid body', async () => {
      // Arrange
      const requestPayload = {
        title: 123,
        body: 'A Body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('title dan body harus string');
    });

    it('should response 201 with a valid payload', async () => {
      // Arrange
      const requestPayload = {
        title: 'This is a title',
        body: 'This is a body',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson).toHaveProperty('data');
      expect(responseJson.data).toHaveProperty('addedThread');
      expect(responseJson.data.addedThread).toBeInstanceOf(Object);
      expect(responseJson.data.addedThread).toHaveProperty('id');
      expect(responseJson.data.addedThread.id).not.toBeUndefined();
      expect(responseJson.data.addedThread).toHaveProperty('title');
      expect(responseJson.data.addedThread.title).not.toBeUndefined();
      expect(responseJson.data.addedThread).toHaveProperty('owner');
      expect(responseJson.data.addedThread.owner).not.toBeUndefined();
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 404 when thread is not found', async () => {
      // Arrange and Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-not-found-123',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson).toHaveProperty('status');
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 200 when thread is found, but with empty comment', async () => {
      // Arrange
      /** add thread */
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
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual(threadPayload.title);
      expect(responseJson.data.thread.body).toEqual(threadPayload.body);
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments.length).toEqual(0);
    });

    it('should response 200 when thread is found with the comments', async () => {
      // Arrange
      /** add thread */
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
        content: 'a comment',
      };

      await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments`,
        headers: { Authorization: `Bearer ${accessToken}` },
        payload: commentPayload,
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data.thread.id).toEqual(threadId);
      expect(responseJson.data.thread.title).toEqual(threadPayload.title);
      expect(responseJson.data.thread.body).toEqual(threadPayload.body);
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments.length).toEqual(1);

      const comment = responseJson.data.thread.comments[0];
      expect(comment.username).toEqual('dicoding');
      expect(comment.content).toEqual(commentPayload.content);
    });
  });
});
