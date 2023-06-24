const CommentDetailWithReplies = require('../CommentDetailWithReplies');

describe('a CommentDetailWithReplies entities', () => {
  it('should throw error when paylod did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new CommentDetailWithReplies(payload)).toThrowError('COMMENT_DETAIL_WITH_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specs', () => {
    // Arrange
    const payload = {
      id: 123,
      username: true,
      date: 123,
      content: '123',
      replies: [],
    };

    // Action and Assert
    expect(() => new CommentDetailWithReplies(payload)).toThrowError('COMMENT_DETAIL_WITH_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create object correctly, and a reply with 0 array length', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'john doe',
      date: '2021-08-08T07:22:33.555Z"',
      content: 'this is a comment',
      replies: [],
    };

    // Action
    const commentDetail = new CommentDetailWithReplies(payload);

    // Assert
    expect(commentDetail.id).toEqual(payload.id);
    expect(commentDetail.username).toEqual(payload.username);
    expect(commentDetail.date).toEqual(payload.date);
    expect(commentDetail.content).toEqual(payload.content);
    expect(commentDetail.replies.length).toEqual(0);
    expect(commentDetail).toStrictEqual(new CommentDetailWithReplies({
      id: 'comment-123',
      username: 'john doe',
      date: '2021-08-08T07:22:33.555Z"',
      content: 'this is a comment',
      replies: [],
    }));
  });
});
