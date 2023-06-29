class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._threadRepository.verifyThreadAvailabilityById(threadId);
    await this._commentRepository.verifyCommentAvailabilityById(commentId);
    await this._userRepository.verifyUserById(userId);
  }
}

module.exports = LikeCommentUseCase;
