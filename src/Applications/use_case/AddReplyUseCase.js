const AddReply = require('../../Domains/replies/entities/AddReply');

class AddReplyUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload, threadId, commentId, ownerId) {
    const addReply = new AddReply(useCasePayload);

    await this._verifyThread(threadId);
    await this._verifyComment(commentId);
    const reply = await this._replyRepository.addReply(addReply, commentId, ownerId);
    return reply;
  }

  async _verifyThread(threadId) {
    try {
      await this._threadRepository.verifyThreadById(threadId);
    } catch (error) {
      throw new Error('ADD_REPLY_USE_CASE.THREAD_NOT_FOUND');
    }
  }

  async _verifyComment(commentId) {
    try {
      await this._commentRepository.findCommentById(commentId);
    } catch (error) {
      throw new Error('ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND');
    }
  }
}

module.exports = AddReplyUseCase;
