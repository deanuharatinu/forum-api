const ThreadDetailWithComments = require('../../Domains/threads/entities/ThreadDetailWithComments');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    let threadWithoutComments = null;
    try {
      threadWithoutComments = await this._threadRepository
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

module.exports = GetThreadDetailUseCase;
