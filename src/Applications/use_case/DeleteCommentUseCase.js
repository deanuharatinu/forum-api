class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(commentId, threadId, userId) {
    await this._verifyUser(userId);
    await this._threadRepository.verifyThreadAvailabilityById(threadId);
    await this._verifyComment(commentId, userId);
    await this._commentRepository.deleteCommentById(commentId);
  }

  async _verifyComment(commentId, userId) {
    let comment;
    try {
      comment = await this._commentRepository.findCommentById(commentId);
    } catch (error) {
      throw new Error('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND');
    }

    if (comment.owner !== userId) {
      throw new Error('DELETE_COMMENT_USE_CASE.USER_NOT_ALLOWED');
    }
  }

  async _verifyUser(userId) {
    try {
      await this._userRepository.verifyUserById(userId);
    } catch (error) {
      throw new Error('DELETE_COMMENT_USE_CASE.USER_NOT_AUTHENTICATED');
    }
  }
}

module.exports = DeleteCommentUseCase;
