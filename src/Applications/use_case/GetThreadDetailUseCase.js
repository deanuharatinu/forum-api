const ThreadDetailWithComments = require('../../Domains/threads/entities/ThreadDetailWithComments');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentDetailWithoutReplies = require('../../Domains/comments/entities/CommentDetailWithoutReplies');

class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository, getCommentDetailUseCase }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._getCommentDetailUseCase = getCommentDetailUseCase;
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
        .getCommentsByThreadId(threadId);

      commentsDetail = await this._getRepliesForComment(commentsDetail);
    } catch (error) {
      // ignore
    }

    const entityPayload = {
      ...threadWithoutComments,
      comments: commentsDetail,
    };

    return new ThreadDetailWithComments(entityPayload);
  }

  async _getRepliesForComment(comments) {
    const promises = comments.map(async (comment) => {
      const { id: commentId } = comment;
      try {
        const replies = await this._getCommentDetailUseCase.execute(commentId);
        return new CommentDetailWithoutReplies({
          id: comment.id,
          username: comment.username,
          date: comment.date,
          content: comment.content,
          isDeleted: comment.isDeleted,
          replies,
        });
      } catch (error) {
        return comment;
      }
    });

    return Promise.all(promises);
  }
}

module.exports = GetThreadDetailUseCase;
