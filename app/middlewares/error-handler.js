'use strict';

let logger = require('logentries-logformat')('app');

let errorPagePath;

let renderError = function(context, message) {
  if (context.is('application/json')) {
    context.body = { error: true, message: message };
  } else if (errorPagePath) {
    context.render(errorPagePath, { message: message });
  } else {
    context.body = message;
  }
};

module.exports = function(errorPage) {
  errorPagePath = errorPage;

  return async function(next) {
    try {
      await next();
    } catch (ex) {
      if (ex.code === 401) {
        this.status = 401;
        renderError(this, 'We\'re sorry, but You are not authorized to take this action');
        logger.error('authentication', ex.message);
      } else {
        this.status = 500;
        renderError(this, 'We\'re sorry, but something went wrong');
        logger.error('internal', ex.message, { stack: ex.stack });
      }
    }
  }
};
