const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class GetReplyDetailUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(commentId) {
    try {
      return await this._replyRepository
        .getRepliesByCommentId(commentId);
    } catch (error) {
      throw new NotFoundError('GET_THREAD_DETAIL_USE_CASE.THREAD_NOT_FOUND');
    }
  }
}

module.exports = GetReplyDetailUseCase;
