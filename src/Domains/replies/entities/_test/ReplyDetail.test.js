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
    const addComment = new ReplyDetail(payload);

    // Assert
    expect(addComment.content).toEqual(payload.content);
  });
});
