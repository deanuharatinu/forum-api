/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
class ThreadRepository {
  async addNewThread(newThread, ownerId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyThreadById(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadRepository;
