const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addNewThreadUseCase = this._container.getInstance(AddNewThreadUseCase.name);

    const { id: userId } = request.auth.credentials;
    const addedThread = await addNewThreadUseCase.execute(request.payload, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });

    response.code(201);
    return response;
  }
}

module.exports = ThreadHandler;
