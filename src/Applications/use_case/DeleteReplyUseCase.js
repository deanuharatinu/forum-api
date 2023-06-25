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
    await this._verifyReply(replyId, commentId, threadId, userId);
    await this._replyRepository.deleteReplyById(replyId);
  }

  async _verifyReply(replyId, commentId, threadId, userId) {
    await this._verifyUser(userId);

    try {
      await this._threadRepository.verifyThreadAvailabilityById(threadId);
    } catch (error) {
      throw new Error('DELETE_REPLY_USE_CASE.THREAD_NOT_FOUND');
    }

    try {
      await this._commentRepository.findCommentById(commentId);
    } catch (error) {
      throw new Error('DELETE_REPLY_USE_CASE.COMMENT_NOT_FOUND');
    }

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
