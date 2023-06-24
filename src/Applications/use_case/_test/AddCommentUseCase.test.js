const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const UserRepository = require('../../../Domains/users/UserRepository');
const AddCommentUseCase = require('../AddCommentUseCase');
const Comment = require('../../../Domains/comments/entities/Comment');

describe('AddCommentUseCase', () => {
  let mockCommentRepository;
  let mockUserRepository;

  beforeEach(() => {
    mockCommentRepository = new CommentRepository();
    mockUserRepository = new UserRepository();
  });

  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();

    const useCasePayload = {
      content: 'a comment for the thread',
    };

    const mockComment = new Comment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    });

    /** mocking */
    mockCommentRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockComment));
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const comment = await addCommentUseCase.execute(useCasePayload, 'user-123', 'thread-123');

    // Assert
    expect(comment).toStrictEqual(new Comment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: 'user-123',
    }));
  });

  it('should throw error when user is not registered', async () => {
    // Arrange
    const useCasePayload = {
      content: '123',
    };

    /** mocking */
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: {},
    });

    // Action and Assert
    await expect(addCommentUseCase.execute(useCasePayload, 'user-123', 'thread-123'))
      .rejects
      .toThrowError('ADD_COMMENT_USE_CASE.USER_NOT_ALLOWED');
  });

  it('should throw error when thread is not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content 123',
    };
    const mockThreadRepository = new ThreadRepository();

    /** mocking */
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyThreadById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await expect(addCommentUseCase.execute(useCasePayload, 'user-123', 'thread-123'))
      .rejects
      .toThrowError('ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND');
  });
});
