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
    const reply = await this._replyRepository.addReply(addReply, commentId, ownerId);
    return reply;
  }
}

module.exports = AddReplyUseCase;
