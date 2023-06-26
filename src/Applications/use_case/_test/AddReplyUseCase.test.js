const AddReplyUseCase = require('../AddReplyUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const Reply = require('../../../Domains/replies/entities/Reply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('AddReplyUseCase', () => {
  it('should throw error when reply not found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('thread tidak ditemukan'); });

    /** create use case */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const useCasePayload = {
      content: 'a content',
    };

    // Action
    await expect(addReplyUseCase.execute(useCasePayload, '', '', ''))
      .rejects
      .toThrowError('thread tidak ditemukan');
  });

  it('should throw error when comment not found', async () => {
    // Arrange
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentAvailabilityById = jest.fn()
      .mockImplementation(() => { throw new NotFoundError('comment tidak ditemukan'); });

    /** create use case */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const useCasePayload = {
      content: 'a content',
    };

    // Action
    await expect(addReplyUseCase.execute(useCasePayload, '', ''))
      .rejects
      .toThrowError('comment tidak ditemukan');
  });

  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const payload = {
      content: 'a reply content',
    };

    const mockReply = new Reply({
      id: 'reply-123',
      content: 'a reply content',
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentAvailabilityById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(mockReply));

    /** create use case */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await addReplyUseCase.execute(payload, 'thread-123', 'comment-123', 'user-123');

    // Assert
    expect(result.id).toEqual(mockReply.id);
    expect(result.content).toEqual(mockReply.content);
    expect(result.owner).toEqual(mockReply.owner);
    expect(result).toStrictEqual(new Reply({
      id: mockReply.id,
      content: mockReply.content,
      owner: mockReply.owner,
    }));

    expect(mockThreadRepository.verifyThreadAvailabilityById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.verifyCommentAvailabilityById).toBeCalledWith('comment-123');
    expect(mockReplyRepository.addReply).toBeCalledWith(payload, 'comment-123', 'user-123');
  });
});
