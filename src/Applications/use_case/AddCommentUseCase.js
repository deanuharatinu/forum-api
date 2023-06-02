const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, userRepository }) {
    this._commentRepository = commentRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload, ownerId) {
    const addComment = new AddComment(useCasePayload);
    await this._verifyUser(ownerId);
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
}

module.exports = AddCommentUseCase;
