const ThreadDetailWithComments = require('../../Domains/threads/entities/ThreadDetailWithComments');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class GetReplyDetailUseCase {
  constructor({ replyRepository }) {
    this._replyRepository = replyRepository;
  }

  async execute(commentId) {
    let replies = null;
    try {
      replies = await this._replyRepository
        .getThreadDetailByThreadId(threadId);
    } catch (error) {
      throw new NotFoundError('GET_THREAD_DETAIL_USE_CASE.THREAD_NOT_FOUND');
    }

    let commentsDetail = [];
    try {
      commentsDetail = await this._commentRepository
        .getCommenstByThreadId(threadId);
    } catch (error) {
      // ignore
    }

    const entityPayload = {
      ...threadWithoutComments,
      comments: commentsDetail,
    };

    return new ThreadDetailWithComments(entityPayload);
  }
}

module.exports = GetReplyDetailUseCase;
