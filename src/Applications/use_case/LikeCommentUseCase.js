class LikeCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._threadRepository.verifyThreadAvailabilityById(threadId);
  }
}

module.exports = LikeCommentUseCase;
