const AddReply = require('../AddReply');

describe('an AddReply', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new object correctly', () => {
    // Arrange
    const payload = {
      content: 'a new content',
    };

    // Action
    const addComment = new AddReply(payload);

    // Assert
    expect(addComment.content).toEqual(payload.content);
    expect(addComment).toStrictEqual(new AddReply({
      content: 'a new content',
    }));
  });
});
