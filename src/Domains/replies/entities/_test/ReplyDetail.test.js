const ReplyDetail = require('../ReplyDetail');

describe('a ReplyDetail', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 123,
      date: '123123',
      username: 'username',
    };

    // Action and Assert
    expect(() => new ReplyDetail(payload)).toThrowError('REPLY_DETAIL.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'new content',
      date: '123123',
      username: 'username',
    };

    // Action
    const addReply = new ReplyDetail(payload);

    // Assert
    expect(addReply.content).toEqual(payload.content);
    expect(addReply).toStrictEqual(new ReplyDetail({
      id: 'reply-123',
      content: 'new content',
      date: '123123',
      username: 'username',
    }));
  });

  it('should hide content if reply was deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'new content',
      date: '123123',
      username: 'username',
      is_deleted: true,
    };

    // Action
    const addReply = new ReplyDetail(payload);

    // Assert
    expect(addReply.id).toEqual(payload.id);
    expect(addReply.content).toEqual('**balasan telah dihapus**');
    expect(addReply.date).toEqual(payload.date);
    expect(addReply.username).toEqual(payload.username);
  });

  it('should show content if reply is not deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      content: 'new content',
      date: '123123',
      username: 'username',
      is_deleted: false,
    };

    // Action
    const addReply = new ReplyDetail(payload);

    // Assert
    expect(addReply.id).toEqual(payload.id);
    expect(addReply.content).toEqual(payload.content);
    expect(addReply.date).toEqual(payload.date);
    expect(addReply.username).toEqual(payload.username);
  });
});
