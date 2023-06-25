const NewThread = require('../../Domains/threads/entities/NewThread');

class AddNewThreadUseCase {
  constructor({ threadRepository, userRepository }) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload, ownerId) {
    const newThread = new NewThread(useCasePayload);
    await this._userRepository.verifyUserById(ownerId);
    const thread = await this._threadRepository.addNewThread(newThread, ownerId);
    return thread;
  }
}

module.exports = AddNewThreadUseCase;
