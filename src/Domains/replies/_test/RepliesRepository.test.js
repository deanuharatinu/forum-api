const RepliesRepository = require('../RepliesRepository');

describe('RepliesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const repliesRepository = new RepliesRepository();

    // Action and Assert
    await expect(repliesRepository.addReply({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.deleteReplyById({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.findReplyById({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.getRepliesByCommentId({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
