'use strict';

let expect = require('chai').expect;
let hook = require('./hook');

describe('Hook Middleware', function() {

  describe('#getMiddleware', function() {

    it('should call next', async function() {
      let middleware = hook.getMiddleware();
      let called = false;
      let next = function() { called = true; };

      await middleware(next);

      expect(called).to.eql(true);
    });


    it('should call the given hook', async function() {
      let middleware = hook.getMiddleware();
      let called = false;
      let hookSpy = function() { called = true; };

      hook.add(hookSpy);
      await middleware(function() {});

      expect(called).to.eql(true);
    });


    it('should call the hooks in the given order before next', async function() {
      let middleware = hook.getMiddleware();
      let called = [];
      let next = function() { called.push('next'); };
      let hookSpy1 = function() { called.push('hookSpy1'); };
      let hookSpy2 = function() { called.push('hookSpy2'); };

      hook.add(hookSpy1);
      hook.add(hookSpy2);
      await middleware(next);

      expect(called).to.eql(['hookSpy1', 'hookSpy2',  'next']);
    });


    it('should call the given hook in the context of the middleware', async function() {
      let context = {};
      let middleware = hook.getMiddleware();
      let calledwith = null;
      let hookSpy = function() { calledwith = this; };

      hook.add(hookSpy);
      await middleware.call(context, function() {});

      expect(calledwith).to.equal(context);
    });

  });

  describe('#reset', function() {

    it('should remove all the hooks', async function() {
      let middleware = hook.getMiddleware();
      let called = false;
      let hookSpy = function () { called = true; };

      hook.add(hookSpy);
      hook.reset();
      await middleware(function() {});

      expect(called).to.eql(false);
    });

  });

});
