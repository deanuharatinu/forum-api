const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const Thread = require('../../../Domains/threads/entities/Thread');
const UserRepository = require('../../../Domains/users/UserRepository');
const AddNewThreadUseCase = require('../AddNewThreadUseCase');

describe('AddNewThreadUseCase', () => {
  let mockThreadRepository;
  let mockUserRepository;

  beforeEach(() => {
    /** creating dependency use case */
    mockThreadRepository = new ThreadRepository();
    mockUserRepository = new UserRepository();
  });

  it('should orchestrating the add new thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      title: 'a title',
      body: 'a body',
    };

    const mockThread = new Thread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    });

    /** mocking */
    mockThreadRepository.addNewThread = jest.fn()
      .mockImplementation(() => Promise.resolve(mockThread));
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => Promise.resolve('user-123'));

    /** creating use case instance */
    const addNewThreadUseCase = new AddNewThreadUseCase({
      threadRepository: mockThreadRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const thread = await addNewThreadUseCase.execute(useCasePayload, 'user-123');

    // Assert
    expect(thread).toStrictEqual(new Thread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: 'user-123',
    }));

    expect(mockThreadRepository.addNewThread).toBeCalledWith(useCasePayload, 'user-123');
    expect(mockUserRepository.verifyUserById).toBeCalledWith('user-123');
  });

  it('should throw error correctly when user is not registered', async () => {
    // Arrange
    const useCasePayload = {
      title: 'a title',
      body: 'a body',
    };

    /** mocking */
    mockUserRepository.verifyUserById = jest.fn()
      .mockImplementation(() => { throw new Error(); });

    /** creating use case instance */
    const addNewThreadUseCase = new AddNewThreadUseCase({
      threadRepository: {},
      userRepository: mockUserRepository,
    });

    // Action and Assert
    await expect(addNewThreadUseCase.execute(useCasePayload, 'user-123'))
      .rejects
      .toThrowError('ADD_NEW_THREAD_USE_CASE.USER_NOT_ALLOWED');
  });
});
