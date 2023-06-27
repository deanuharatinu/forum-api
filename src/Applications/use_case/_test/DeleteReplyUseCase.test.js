const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');
const Reply = require('../../../Domains/replies/entities/Reply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('DeleteReplyUseCase', () => {
  it('should throw error when user is not authenticated', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteReplyUseCase.execute('reply-123', 'comment-123', 'thread-123', 'user-123'))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.USER_NOT_AUTHENTICATED');
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
  });

  it('should throw error when thread is not found', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => { throw new NotFoundError(); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteReplyUseCase.execute('reply-123', 'comment-123', 'thread-123', 'user-123'))
      .rejects
      .toThrowError(NotFoundError);
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
  });

  it('should throw error when comment is not found', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => { throw new NotFoundError(); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteReplyUseCase.execute('reply-123', 'comment-123', 'thread-123', 'user-123'))
      .rejects
      .toThrowError(NotFoundError);
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
  });

  it('should throw error when reply is not found', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteReplyUseCase.execute('reply-123', 'comment-123', 'thread-123', 'user-123'))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.REPLY_NOT_FOUND');
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockReplyRepository.findReplyById).toBeCalledWith('reply-123');
  });

  it('should throw error when user is not authorized to delete reply', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();
    const unauthorizedUser = 'user-1234';

    const reply = new Reply({
      id: 'reply-123', content: 'content reply', owner: 'user-123',
    });

    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve(reply));

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(deleteReplyUseCase.execute('reply-123', 'comment-123', 'thread-123', unauthorizedUser))
      .rejects
      .toThrowError('DELETE_REPLY_USE_CASE.USER_NOT_ALLOWED');
    expect(mockUserRepository.verifyUserById).toBeCalledWith(unauthorizedUser);
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockReplyRepository.findReplyById).toBeCalledWith('reply-123');
  });

  it('should orchestrating and called deleteReplyById one time', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockUserRepository = new UserRepository();

    const reply = new Reply({
      id: 'reply-123', content: 'content reply', owner: 'user-123',
    });

    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.findReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve(reply));
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      replyRepository: mockReplyRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await deleteReplyUseCase.execute('reply-123', 'comment-123', 'thread-123', 'user-123');

    // Assert
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith('reply-123');
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.findCommentById).toBeCalledWith('comment-123');
    expect(mockReplyRepository.findReplyById).toBeCalledWith('reply-123');
  });
});
