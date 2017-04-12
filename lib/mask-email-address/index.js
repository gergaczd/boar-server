'use strict';

let _ = require('lodash');

module.exports = function(emailAddress) {
  if (!emailAddress) return;
  let firstCharacter = _.first(emailAddress);
  let lastCharacter = _.last(emailAddress.split('@')[0]);

  return  firstCharacter + '***' + lastCharacter + '@' + emailAddress.replace(/^.*@/, '');
};
