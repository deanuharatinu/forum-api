const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const Comment = require('../../../Domains/comments/entities/Comment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');

describe('DeleteCommentUseCase', () => {
  it('should throw error when user is not authorized', async () => {
    // Arrange
    const mockCommentId = 'comment-123456';
    const mockUserId = 'usernotauthorized-12345';
    const realUserId = 'userathorized-12345';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(new Comment({
        id: mockCommentId, content: 'content', owner: realUserId,
      })));
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(mockCommentId, mockUserId))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.USER_NOT_ALLOWED');
  });

  it('should throw error when user is not authenticated', async () => {
    // Arrange
    const mockCommentId = 'comment-123456';
    const mockUserId = 'usernotauthorized-12345';
    const realUserId = 'userathorized-12345';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(new Comment({
        id: mockCommentId, content: 'content', owner: realUserId,
      })));
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    /** create use case */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(mockCommentId, mockUserId))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.USER_NOT_AUTHENTICATED');
  });

  it('should throw error when comment is not found', async () => {
    // Arrange
    const mockCommentId = 'comment-123456';
    const mockUserId = 'usernotauthorized-12345';

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => { throw new Error(); });
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(mockCommentId, mockUserId))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND');
  });

  it('should not throw error when comment is found and deleted', async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(new Comment({
        id: 'comment-1234', content: 'a content', owner: 'user-1234',
      })));
    mockCommentRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    /** create use case */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute('comment-1234', 'thread-123', 'user-1234'))
      .resolves.not.toThrowError();
  });

  it('should throw error when thread is not found', async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    /** mocking */
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute())
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND');
  });
});
