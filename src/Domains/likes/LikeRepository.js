/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
class LikeRepository {
  async addLikeComment(commentId, userId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteLikeComment(commentId, userId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyLikeAvailabililty(commentId, userId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = LikeRepository;
