/* eslint-disable class-methods-use-this */
class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, date, username, is_deleted: isDeleted,
    } = payload;

    this.id = id;
    this.content = this._setDeletedComment(content, isDeleted);
    this.date = date;
    this.username = username;
  }

  _verifyPayload({
    id, content, date, username,
  }) {
    if (!id || !content || !date || !username) {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof date !== 'string' || typeof username !== 'string') {
      throw new Error('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  _setDeletedComment(content, isDeleted) {
    if (isDeleted) {
      return '**balasan telah dihapus**';
    }

    return content;
  }
}

module.exports = ReplyDetail;
