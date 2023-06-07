const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ThreadDetailWithoutComments = require('../../../Domains/threads/entities/ThreadDetailWithoutComments');
const CommentDetail = require('../../../Domains/comments/entities/CommentDetail');

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
  });

  it('should get correct object of ThreadDetailWithComments, with comment as an empty array', async () => {
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
    mockCommentRepository.getCommenstByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** create use case */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute('');

    // Assert
    expect(result.id).toEqual('id');
    expect(result.title).toEqual('a title');
    expect(result.body).toEqual('a body');
    expect(result.date).toEqual('a date');
    expect(result.username).toEqual('username-1');
    expect(result.comments.length).toEqual(0);
  });

  it('should get correct object of ThreadDetailWithComments', async () => {
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
      }),
    ];
    mockCommentRepository.getCommenstByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(comments));

    /** create use case */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute('');

    // Assert
    expect(result.id).toEqual('id');
    expect(result.title).toEqual('a title');
    expect(result.body).toEqual('a body');
    expect(result.date).toEqual('a date');
    expect(result.username).toEqual('username-1');
    expect(result.comments.length).toEqual(1);
  });
});
