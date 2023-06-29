const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
  it('should throw error when thread is not found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    mockThreadRepository.verifyThreadAvailabilityById = jest.fn(() => Promise.resolve());

    const likeCommentUseCase = new LikeCommentUseCase({ threadRepository: mockThreadRepository });

    // Action and Assert
    await expect(likeCommentUseCase.execute('thread-not-found', 'comment-not-found', 'user-123'))
      .rejects
      .toThrowError(NotFoundError);
  });
});
