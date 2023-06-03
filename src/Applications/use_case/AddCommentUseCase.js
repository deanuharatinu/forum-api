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
    await this._verifyUser(ownerId);
    // TODO verifyThread belum ada real implementationnya
    await this._verifyThread(threadId);
    const comment = await this._commentRepository.addComment(addComment);
    return comment;
  }

  async _verifyUser(ownerid) {
    try {
      await this._userRepository.verifyUserById(ownerid);
    } catch (error) {
      throw new Error('ADD_COMMENT_USE_CASE.USER_NOT_ALLOWED');
    }
  }

  async _verifyThread(threadId) {
    try {
      await this._threadRepository.verifyThreadById(threadId);
    } catch (error) {
      // TODO harus dibikin domain translator
      throw new Error('ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND');
    }
  }
}

module.exports = AddCommentUseCase;
