'use strict';


let hooks = [];

module.exports = {

  getMiddleware: function() {
    return async function(next) {
      hooks.forEach(function(hook) {
        hook.call(this);
      }, this);

      await next();
    }
  },


  add: function(hook) {
    hooks.push(hook);
  },


  reset: function() {
    hooks = [];
  }

};
