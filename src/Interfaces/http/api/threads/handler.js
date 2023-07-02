const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const AddNewThreadUseCase = require('../../../../Applications/use_case/AddNewThreadUseCase');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');
const GetThreadDetailUseCase = require('../../../../Applications/use_case/GetThreadDetailUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
    this.addReplyHandler = this.addReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    this.putLikeHandler = this.putLikeHandler.bind(this);
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

  async deleteCommentHandler(request, h) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    await deleteCommentUseCase.execute(commentId, threadId, userId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async getThreadDetailHandler(request, h) {
    const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);

    const { threadId } = request.params;
    const threadDetailWithComments = await getThreadDetailUseCase.execute(threadId);

    const response = h.response({
      status: 'success',
      data: {
        thread: threadDetailWithComments,
      },
    });
    response.code(200);
    return response;
  }

  async addReplyHandler(request, h) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    const reply = await addReplyUseCase.execute(request.payload, threadId, commentId, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedReply: reply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyHandler(request, h) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    const { replyId, threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    await deleteReplyUseCase.execute(replyId, commentId, threadId, userId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async putLikeHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);

    const { threadId, commentId } = request.params;
    const { id: userId } = request.auth.credentials;
    await likeCommentUseCase.execute(threadId, commentId, userId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
