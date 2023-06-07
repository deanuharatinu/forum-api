/* eslint-disable class-methods-use-this */
class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    // username (is an id) referenced to table users for getting the name
    const {
      id, username, date, content, is_deleted: isDeleted,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = this._setDeletedComment(content, isDeleted);
  }

  _verifyPayload({
    id, username, date, content,
  }) {
    if (!id || !username || !date || !content) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof content !== 'string') {
      throw new Error('COMMENT_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _setDeletedComment(content, isDeleted) {
    if (isDeleted) {
      return '**komentar telah dihapus**';
    }

    return content;
  }
}

module.exports = CommentDetail;