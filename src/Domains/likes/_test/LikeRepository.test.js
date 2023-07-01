const LikeRepository = require('../LikeRepository');

describe('LikeRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likeRepository = new LikeRepository();

    // Action and Assert
    await expect(likeRepository.addLikeComment({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.deleteLikeComment({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likeRepository.verifyLikeAvailabililty({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
