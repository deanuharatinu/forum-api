const AuthenticationError = require('../../../Commons/exceptions/AuthenticationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should throw error when thread is not found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn(() => {
      throw new NotFoundError();
    });

    const likeCommentUseCase = new LikeCommentUseCase({ threadRepository: mockThreadRepository });

    // Action and Assert
    await expect(likeCommentUseCase.execute('thread-not-found', 'comment-not-found', 'user-123'))
      .rejects
      .toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-not-found');
  });

  it('should throw error when comment is not found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailabilityById = jest.fn(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentAvailabilityById = jest.fn(() => {
      throw new NotFoundError();
    });

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action and Assert
    await expect(likeCommentUseCase.execute('thread-123', 'comment-not-found', 'user-123'))
      .rejects
      .toThrowError(NotFoundError);
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailabilityById).toBeCalledWith('comment-not-found');
  });

  it('should throw error when user is not authenticated', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();

    mockThreadRepository.verifyThreadAvailabilityById = jest.fn(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentAvailabilityById = jest.fn(() => Promise.resolve('comment-123'));
    mockUserRepository.verifyUserById = jest.fn(() => { throw new AuthenticationError(); });

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(likeCommentUseCase.execute('thread-123', 'comment-123', 'user-not-authenticated'))
      .rejects
      .toThrowError(AuthenticationError);
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailabilityById).toBeCalledWith('comment-123');
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-not-authenticated');
  });

  it('should call addLikeComment when like is not found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailabilityById = jest.fn(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentAvailabilityById = jest.fn(() => Promise.resolve('comment-123'));
    mockUserRepository.verifyUserById = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailabililty = jest.fn(() => { throw new Error(); });
    mockLikeRepository.addLikeComment = jest.fn(() => Promise.resolve('like-123'));
    mockLikeRepository.deleteLikeComment = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute('thread-123', 'comment-123', 'user-123');

    // Assert
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailabilityById).toBeCalledWith('comment-123');
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
    expect(mockLikeRepository.verifyLikeAvailabililty).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.deleteLikeComment).toBeCalledTimes(0);
    expect(mockLikeRepository.addLikeComment).toBeCalledWith('comment-123', 'user-123');
  });

  it('should call deleteLikeComment when like is found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockUserRepository = new UserRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyThreadAvailabilityById = jest.fn(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentAvailabilityById = jest.fn(() => Promise.resolve('comment-123'));
    mockUserRepository.verifyUserById = jest.fn(() => Promise.resolve());
    mockLikeRepository.verifyLikeAvailabililty = jest.fn(() => Promise.resolve());
    mockLikeRepository.addLikeComment = jest.fn(() => Promise.resolve('like-123'));
    mockLikeRepository.deleteLikeComment = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await likeCommentUseCase.execute('thread-123', 'comment-123', 'user-123');

    // Assert
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailabilityById).toBeCalledWith('comment-123');
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
    expect(mockLikeRepository.verifyLikeAvailabililty).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.deleteLikeComment).toBeCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.addLikeComment).toBeCalledTimes(0);
  });
});
