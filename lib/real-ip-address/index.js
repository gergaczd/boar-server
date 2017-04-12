'use strict';

let getLastIpAddress = function(forwardedHeader) {
  return forwardedHeader.split(',').pop().replace(/\/.*/gi, '');
};


let getRemoteAddress = function(connection) {
  if (!connection) return;
  return connection.remoteAddress;
};


module.exports = function(request) {
  let forwardedHeader = request.headers['x-forwarded-for'];

  if (forwardedHeader) return getLastIpAddress(forwardedHeader);
  return getRemoteAddress(request.connection);
};
