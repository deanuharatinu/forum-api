const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({
    commentRepository, userRepository, threadRepository,
  }) {
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, ownerId, threadId) {
    const addComment = new AddComment(useCasePayload);
    await this._userRepository.verifyUserById(ownerId);
    await this._threadRepository.verifyThreadAvailabilityById(threadId);
    const comment = await this._commentRepository.addComment(addComment, threadId, ownerId);
    return comment;
  }
}

module.exports = AddCommentUseCase;
