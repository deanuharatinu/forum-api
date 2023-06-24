const Reply = require('../Reply');

describe('a Reply', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 133,
      content: 123,
      owner: 'user-1231234abc',
    };

    // Action and Assert
    expect(() => new Reply(payload)).toThrowError('REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new object correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-1231',
      content: 'a new content',
      owner: 'user-12312',
    };

    // Action
    const addComment = new Reply(payload);

    // Assert
    expect(addComment.id).toEqual(payload.id);
    expect(addComment.content).toEqual(payload.content);
    expect(addComment.owner).toEqual(payload.owner);
    expect(addComment).toStrictEqual(new Reply({
      id: 'reply-1231',
      content: 'a new content',
      owner: 'user-12312',
    }));
  });
});
