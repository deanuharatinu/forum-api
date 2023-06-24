const Thread = require('../Thread');

describe('a Thread entities', () => {
  it('should throw error when payload did not containt needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'title',
      owner: true,
    };

    // Action and Assert
    expect(() => new Thread(payload)).toThrowError('THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      id: '123',
      title: 'title',
      owner: 'owner-123',
    };

    // Action
    const thread = new Thread(payload);

    // Assert
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.owner).toEqual(payload.owner);
    expect(thread).toStrictEqual(new Thread({
      id: '123',
      title: 'title',
      owner: 'owner-123',
    }));
  });
});
