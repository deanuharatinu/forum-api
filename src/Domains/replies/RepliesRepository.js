/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
class RepliesRepository {
  async addReply(addReply, ownerId) {
    throw new Error('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteReplyById(replyId) {
    throw new Error('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async findReplyById(replyId) {
    throw new Error('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getRepliesByCommentId(commentId) {
    throw new Error('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = RepliesRepository;
