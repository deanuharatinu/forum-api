class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }

  async execute(commentId, userId) {
    await this._verifyComment(commentId, userId);
    await this._commentRepository.deleteCommentById(commentId);
  }

  async _verifyComment(commentId, userId) {
    const comment = await this._commentRepository.findCommentById(commentId);

    if (comment.owner !== userId) {
      throw new Error('DELETE_COMMENT_USE_CASE.USER_NOT_ALLOWED');
    }
  }
}

module.exports = DeleteCommentUseCase;
