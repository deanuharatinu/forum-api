const Comment = require('../Comment');

describe('a Comment entities', () => {
  it('should throw error when paylod did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specs', () => {
    // Arrange
    const payload = {
      id: 123,
      content: true,
      owner: '123',
    };

    // Action and Assert
    expect(() => new Comment(payload)).toThrowError('COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create object correctly', () => {
    // Arrange
    const payload = {
      id: '123',
      content: 'content',
      owner: '123',
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.owner).toEqual(payload.owner);
    expect(comment).toStrictEqual(new Comment({
      id: '123',
      content: 'content',
      owner: '123',
    }));
  });

  it('should show content when isDeleted == false', () => {
    // Arrange
    const payload = {
      id: '123',
      content: 'content',
      owner: '123',
      is_deleted: false,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual(payload.content);
    expect(comment.owner).toEqual(payload.owner);
    expect(comment).toStrictEqual(new Comment({
      id: '123',
      content: 'content',
      owner: '123',
    }));
  });

  it('should hide content when isDeleted == true', () => {
    // Arrange
    const payload = {
      id: '123',
      content: 'content',
      owner: '123',
      is_deleted: true,
    };

    // Action
    const comment = new Comment(payload);

    // Assert
    expect(comment.id).toEqual(payload.id);
    expect(comment.content).toEqual('**komentar telah dihapus**');
    expect(comment.owner).toEqual(payload.owner);
    expect(comment).toStrictEqual(new Comment({
      id: '123',
      content: '**komentar telah dihapus**',
      owner: '123',
    }));
  });
});
