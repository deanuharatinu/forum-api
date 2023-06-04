const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const Comment = require('../../../Domains/comments/entities/Comment');

describe('DeleteCommentUseCase', () => {
  it('should throw error when user is not authorized', async () => {
    // Arrange
    const mockCommentId = 'comment-123456';
    const mockUserId = 'usernotauthorized-12345';
    const realUserId = 'userathorized-12345';

    const mockCommentRepository = new CommentRepository();

    /** mocking */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(new Comment({
        id: mockCommentId, content: 'content', owner: realUserId,
      })));

    /** create use case */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(mockCommentId, mockUserId))
      .rejects
      .toThrowError('DELETE_COMMENT_USE_CASE.USER_NOT_ALLOWED');
  });

  it('should throw error when comment is not found', async () => {
    // Arrange
    const mockCommentId = 'comment-123456';
    const mockUserId = 'usernotauthorized-12345';

    const mockCommentRepository = new CommentRepository();

    /** mocking */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    /** create use case */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(mockCommentId, mockUserId))
      .rejects
      .toThrowError();
  });

  it('should throw error when comment is not found', async () => {
    // Arrange
    const mockCommentId = 'comment-123456';
    const mockUserId = 'usernotauthorized-12345';

    const mockCommentRepository = new CommentRepository();

    /** mocking */
    mockCommentRepository.findCommentById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    /** create use case */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    // Action and Assert
    await expect(deleteCommentUseCase.execute(mockCommentId, mockUserId))
      .rejects
      .toThrowError();
  });
});
