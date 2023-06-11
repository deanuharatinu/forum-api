/* eslint-disable class-methods-use-this */
class CommentDetailWithoutReplies {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, is_deleted: isDeleted, replies = [],
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = this._setDeletedComment(content, isDeleted);
    this.replies = replies;
  }

  _verifyPayload({
    id, username, date, content,
  }) {
    if (!id || !username || !date || !content) {
      throw new Error('COMMENT_DETAIL_WITHOUT_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof content !== 'string') {
      throw new Error('COMMENT_DETAIL_WITHOUT_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _setDeletedComment(content, isDeleted) {
    if (isDeleted) {
      return '**komentar telah dihapus**';
    }

    return content;
  }
}

module.exports = CommentDetailWithoutReplies;
