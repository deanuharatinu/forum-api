const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadDetailWithoutComments = require('../../../Domains/threads/entities/ThreadDetailWithoutComments');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetailWithReplies');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const GetCommentDetailUseCase = require('../GetCommentDetailUseCase');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadDetailUseCase', () => {
  it('should throw error when thread is not found', async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking */
    mockThreadRepository.getThreadDetailByThreadId = jest.fn()
      .mockImplementation(() => { throw new Error('thread tidak ditemukan'); });

    /** create use case */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action and Assert
    await expect(getThreadDetailUseCase.execute('thread'))
      .rejects
      .toThrowError('GET_THREAD_DETAIL_USE_CASE.THREAD_NOT_FOUND');
    expect(mockThreadRepository.getThreadDetailByThreadId).toBeCalledWith('thread');
  });

  it('should get correct object of ThreadDetailWithComments, with comment as an empty array', async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking */
    mockThreadRepository.getThreadDetailByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(new ThreadDetailWithoutComments({
        id: 'id',
        title: 'a title',
        body: 'a body',
        date: 'a date',
        username: 'username-1',
      })));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** create use case */
    const getCommentDetailUseCase = new GetCommentDetailUseCase({
      replyRepository: mockReplyRepository,
    });
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      getCommentDetailUseCase,
    });

    // Action
    const result = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(result.id).toEqual('id');
    expect(result.title).toEqual('a title');
    expect(result.body).toEqual('a body');
    expect(result.date).toEqual('a date');
    expect(result.username).toEqual('username-1');
    expect(result.comments.length).toEqual(0);

    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadDetailByThreadId).toBeCalledWith('thread-123');
  });

  it('should get correct object of ThreadDetailWithComments, with 0 replies', async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    /** mocking */
    mockThreadRepository.getThreadDetailByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(new ThreadDetailWithoutComments({
        id: 'id',
        title: 'a title',
        body: 'a body',
        date: 'a date',
        username: 'username-1',
      })));

    const comments = [
      new CommentDetail({
        id: 'comment-123',
        username: 'username-1',
        date: 'a date',
        content: 'a content',
        is_deleted: false,
        replies: [],
      }),
    ];
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));

    /** create use case */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(result.id).toEqual('id');
    expect(result.title).toEqual('a title');
    expect(result.body).toEqual('a body');
    expect(result.date).toEqual('a date');
    expect(result.username).toEqual('username-1');
    expect(result.comments.length).toEqual(1);

    expect(mockThreadRepository.getThreadDetailByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
  });

  it('should get correct object of ThreadDetailWithComments, with 1 replies', async () => {
    // Arrange
    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking */
    mockThreadRepository.getThreadDetailByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(new ThreadDetailWithoutComments({
        id: 'id',
        title: 'a title',
        body: 'a body',
        date: 'a date',
        username: 'username-1',
      })));

    const replies = [
      new ReplyDetail({
        id: 'reply-123',
        username: 'username-1',
        date: 'a date',
        content: 'a reply',
        is_deleted: false,
      }),
    ];

    const comments = [
      new CommentDetail({
        id: 'comment-123',
        username: 'username-1',
        date: 'a date',
        content: 'a content',
        is_deleted: false,
        replies: [],
      }),
    ];
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));
    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(replies));

    const getCommentDetailUseCase = new GetCommentDetailUseCase({
      replyRepository: mockReplyRepository,
    });

    /** create use case */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      getCommentDetailUseCase,
    });

    // Action
    const result = await getThreadDetailUseCase.execute('thread-123');

    // Assert
    expect(result.id).toEqual('id');
    expect(result.title).toEqual('a title');
    expect(result.body).toEqual('a body');
    expect(result.date).toEqual('a date');
    expect(result.username).toEqual('username-1');
    expect(result.comments.length).toEqual(1);

    expect(result.comments.length).toEqual(1);
    const reply = result.comments[0].replies[0];
    expect(reply.id).toEqual('reply-123');

    expect(mockThreadRepository.getThreadDetailByThreadId).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith(comments[0].id);
  });
});
