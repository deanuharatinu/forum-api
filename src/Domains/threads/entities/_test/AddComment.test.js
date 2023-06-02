const AddComment = require('../AddComment');

describe('an AddComment', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create new object correctly', () => {
    // Arrange
    const payload = {
      content: 'a new content',
    };

    // Action
    const addComment = new AddComment(payload);

    // Assert
    expect(addComment.content).toEqual(payload.content);
  });
});
