const ThreadDetailWithoutComments = require('../ThreadDetailWithoutComments');

describe('a ThreadDetailWithoutComments entities', () => {
  it('should throw error when payload did not containt needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new ThreadDetailWithoutComments(payload)).toThrowError('THREAD_DETAIL_WITHOUT_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'a title',
      body: 'a body',
      date: 12312312,
      username: 'username',
    };

    // Action and Assert
    expect(() => new ThreadDetailWithoutComments(payload)).toThrowError('THREAD_DETAIL_WITHOUT_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create thread object correctly', () => {
    // Arrange
    const payload = {
      id: '123',
      title: 'a title',
      body: 'a body',
      date: '12312312',
      username: 'username',
    };

    // Action
    const thread = new ThreadDetailWithoutComments(payload);

    // Assert
    expect(thread.id).toEqual(payload.id);
    expect(thread.title).toEqual(payload.title);
    expect(thread.body).toEqual(payload.body);
    expect(thread.date).toEqual(payload.date);
    expect(thread.username).toEqual(payload.username);
    expect(thread).toStrictEqual(new ThreadDetailWithoutComments({
      id: '123',
      title: 'a title',
      body: 'a body',
      date: '12312312',
      username: 'username',
    }));
  });
});
