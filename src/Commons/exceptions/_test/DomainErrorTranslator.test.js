const DomainErrorTranslator = require('../DomainErrorTranslator');
const InvariantError = require('../InvariantError');
const AuthenticationError = require('../AuthenticationError');
const NotFoundError = require('../NotFoundError');
const AuthorizationError = require('../AuthorizationError');

describe('DomainErrorTranslator', () => {
  it('should translate error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_LIMIT_CHAR')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'));
    expect(DomainErrorTranslator.translate(new Error('REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER')))
      .toStrictEqual(new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'));
  });

  it('should translate NewThread error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('tidak dapat menambahkan thread karena properti yang dibutuhkan tidak sesuai'));
    expect(DomainErrorTranslator.translate(new Error('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('title dan body harus string'));
  });

  it('should translate AddNewThread error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('ADD_NEW_THREAD_USE_CASE.USER_NOT_ALLOWED')))
      .toStrictEqual(new AuthenticationError('user tidak dikenal'));
  });

  it('should translate AddComment error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')))
      .toStrictEqual(new InvariantError('content tidak boleh kosong'));
    expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')))
      .toStrictEqual(new InvariantError('content harus string'));
  });

  it('should translate AddCommentUseCase error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('ADD_COMMENT_USE_CASE.THREAD_NOT_FOUND')))
      .toStrictEqual(new NotFoundError('thread tidak ditemukan'));
  });

  it('should translate DeleteCommentUseCase error correctly', () => {
    expect(DomainErrorTranslator.translate(new Error('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND')))
      .toStrictEqual(new NotFoundError('thread tidak ditemukan'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_COMMENT_USE_CASE.USER_NOT_ALLOWED')))
      .toStrictEqual(new AuthorizationError('user tidak memiliki akses'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_COMMENT_USE_CASE.USER_NOT_AUTHENTICATED')))
      .toStrictEqual(new AuthenticationError('user tidak terautentikasi'));
    expect(DomainErrorTranslator.translate(new Error('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND')))
      .toStrictEqual(new NotFoundError('komentar tidak ditemukan'));
  });

  it('should return original error when error message is not needed to translate', () => {
    // Arrange
    const error = new Error('some_error_message');

    // Action
    const translatedError = DomainErrorTranslator.translate(error);

    // Assert
    expect(translatedError).toStrictEqual(error);
  });
});
