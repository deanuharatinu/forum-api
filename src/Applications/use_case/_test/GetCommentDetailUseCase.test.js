const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ReplyDetail = require('../../../Domains/replies/entities/ReplyDetail');
const GetCommentDetailUseCase = require('../GetCommentDetailUseCase');

describe('GetCommentDetailUseCase', () => {
  it('should throw error when reply is not found', async () => {
    // Arrange
    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    const getCommentDetailUseCase = new GetCommentDetailUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action and Assert
    await expect(getCommentDetailUseCase.execute('reply-123'))
      .rejects
      .toThrowError('GET_THREAD_DETAIL_USE_CASE.THREAD_NOT_FOUND');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('reply-123');
  });

  it('should return correct reply object', async () => {
    // Arrange
    const replies = [
      new ReplyDetail({
        id: '123',
        content: 'a content',
        date: 'date',
        username: 'username',
        is_deleted: false,
      }),
    ];

    const mockReplyRepository = new ReplyRepository();

    mockReplyRepository.getRepliesByCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve(replies));

    const getCommentDetailUseCase = new GetCommentDetailUseCase({
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getCommentDetailUseCase.execute('reply-123');

    // Assert
    expect(result.length).toEqual(1);
    const reply = result[0];
    expect(reply.id).toEqual('123');
    expect(reply.content).toEqual('a content');
    expect(reply.date).toEqual('date');
    expect(reply.username).toEqual('username');
    expect(mockReplyRepository.getRepliesByCommentId).toBeCalledWith('reply-123');
  });
});
