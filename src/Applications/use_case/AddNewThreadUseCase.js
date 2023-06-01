const NewThread = require('../../Domains/threads/entities/NewThread');

class AddNewThreadUseCase {
  constructor(threadRepository, userRepository) {
    this._threadRepository = threadRepository;
    this._userRepository = userRepository;
  }

  async execute(useCasePayload, ownerId) {
    const newThread = new NewThread(useCasePayload);
    await this._verifyUser(ownerId);
    const thread = await this._threadRepository.addNewThread(newThread, ownerId);
    return thread;
  }

  async _verifyUser(ownerId) {
    try {
      await this._userRepository.verifyUserById(ownerId);
    } catch (error) {
      // TODO ini harus ditranslate errornya
      throw new Error('ADD_NEW_THREAD_USE_CASE.USER_NOT_ALLOWED');
    }
  }
}

module.exports = AddNewThreadUseCase;
