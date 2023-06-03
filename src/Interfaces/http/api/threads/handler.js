const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addNewThreadUseCase = this._container.getInstance(AddNewThreadUseCase.name);

    const { id: userId } = request.auth.credentials;
    const addedThreadDetail = await addNewThreadUseCase.execute(request.payload, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread: addedThreadDetail,
      },
    });

    response.code(201);
    return response;
  }

  async postCommentHandler(request, h) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;

    const addedCommentDetail = await addCommentUseCase.execute(request.payload, userId, threadId);

    const response = h.response({
      status: 'success',
      data: {
        addedComment: addedCommentDetail,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = ThreadsHandler;
