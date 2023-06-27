class DeleteReplyUseCase {
  constructor({
    replyRepository, commentRepository, threadRepository, userRepository,
  }) {
    this._replyRepository = replyRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(replyId, commentId, threadId, userId) {
    await this._verifyUser(userId);
    await this._threadRepository.verifyThreadAvailabilityById(threadId);
    await this._commentRepository.findCommentById(commentId);
    await this._verifyReply(replyId, userId);
    await this._replyRepository.deleteReplyById(replyId);
  }

  async _verifyReply(replyId, userId) {
    let reply;
    try {
      reply = await this._replyRepository.findReplyById(replyId);
    } catch (error) {
      throw new Error('DELETE_REPLY_USE_CASE.REPLY_NOT_FOUND');
    }

    if (reply.owner !== userId) {
      throw new Error('DELETE_REPLY_USE_CASE.USER_NOT_ALLOWED');
    }
  }

  async _verifyUser(userId) {
    try {
      await this._userRepository.verifyUserById(userId);
    } catch (error) {
      throw new Error('DELETE_REPLY_USE_CASE.USER_NOT_AUTHENTICATED');
    }
  }
}

module.exports = DeleteReplyUseCase;
