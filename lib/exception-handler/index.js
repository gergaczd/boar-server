'use strict';

let _ = require('lodash');

class ExceptionHandler {

  static create(exception, returnHandler) {
    let handledExceptions = _.toArray(arguments).slice(2);

    if (!_.isBoolean(returnHandler)) {
      handledExceptions.unshift(returnHandler);
      returnHandler = false;
    }

    return new ExceptionHandler(exception, returnHandler, handledExceptions).execute();
  }

  constructor(exception, returnHandler, handledExceptions) {
    this._exception = exception;
    this._handledExceptions = handledExceptions;
    this._handledException = null;
    this._returnHandler = returnHandler;
  }

  execute() {
    _.forEach(this._handledExceptions, _.bind(this._setHandledExceptionOnMatch, this));

    if (!this._handledException) this._delegateException();

    if (this._returnHandler) {
      return this._handledException.execute;
    }

    this._handledException.execute(this._exception);
  }

  _setHandledExceptionOnMatch(handledException) {
    if (!this._exceptionMatches(handledException)) return true;

    this._handledException = handledException;
    return false;
  }

  _exceptionMatches(handledException) {
    return this._typeMatches(handledException.type) &&
      this._codeMatches(handledException.code) &&
      this._replyCodeMatches(handledException.replyCode);
  }

  _typeMatches(type) {
    return !type || this._exception instanceof type;
  }

    _codeMatches(code) {
    return !code || this._exception.code === code;
  }

  _replyCodeMatches(replyCode) {
    return !replyCode || this._exception.replyCode === replyCode;
  }

  _delegateException() {
    throw this._exception;
  }
}

module.exports = ExceptionHandler.create;
