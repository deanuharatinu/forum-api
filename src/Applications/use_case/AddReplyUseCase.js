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
    await this._threadRepository.verifyThreadAvailabilityById(threadId);
    await this._commentRepository.verifyCommentAvailabilityById(commentId);
    // await this._verifyCommentAvailibity(commentId);
    const reply = await this._replyRepository.addReply(addReply, commentId, ownerId);
    return reply;
  }

  // async _verifyCommentAvailibity(commentId) {
  //   try {
  //     await this._commentRepository.findCommentById(commentId);
  //   } catch (error) {
  //     throw new Error('ADD_REPLY_USE_CASE.COMMENT_NOT_FOUND');
  //   }
  // }
}

module.exports = AddReplyUseCase;
