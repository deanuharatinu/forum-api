class LikeCommentUseCase {
  constructor({
    threadRepository, commentRepository, userRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId, commentId, userId) {
    await this._threadRepository.verifyThreadAvailabilityById(threadId);
    await this._commentRepository.verifyCommentAvailabilityById(commentId);
    await this._userRepository.verifyUserById(userId);
    try {
      await this._likeRepository.verifyLikeAvailabililty(commentId, userId);
      // if no error being thrown, then delete like
      await this._likeRepository.deleteLikeComment(commentId, userId);
    } catch (error) {
      await this._likeRepository.addLikeComment(commentId, userId);
    }
  }
}

module.exports = LikeCommentUseCase;
