'use strict';

let expect = require('chai').expect;
let hook = require('./hook');

describe('Hook Middleware', function() {

  describe('#getMiddleware', function() {

    it('should call next', function* () {
      let middleware = hook.getMiddleware();
      let called = false;
      let next = function* () { called = true; };

      yield middleware(next);

      expect(called).to.eql(true);
    });


    it('should call the given hook', function* () {
      let middleware = hook.getMiddleware();
      let called = false;
      let hookSpy = function () { called = true; };

      hook.add(hookSpy);
      yield middleware(function* () {});

      expect(called).to.eql(true);
    });


    it('should call the hooks in the given order before next', function* () {
      let middleware = hook.getMiddleware();
      let called = [];
      let next = function* () { called.push('next'); };
      let hookSpy1 = function() { called.push('hookSpy1'); };
      let hookSpy2 = function() { called.push('hookSpy2'); };

      hook.add(hookSpy1);
      hook.add(hookSpy2);
      yield middleware(next);

      expect(called).to.eql(['hookSpy1', 'hookSpy2',  'next']);
    });


    it('should call the given hook in the context of the middleware', function* () {
      let context = {};
      let middleware = hook.getMiddleware();
      let calledwith = null;
      let hookSpy = function() { calledwith = this; };

      hook.add(hookSpy);
      yield middleware.call(context, function* () {});

      expect(calledwith).to.equal(context);
    });

  });

  describe('#reset', function() {

    it('should remove all the hooks', function* () {
      let middleware = hook.getMiddleware();
      let called = false;
      let hookSpy = function () { called = true; };

      hook.add(hookSpy);
      hook.reset();
      yield middleware(function* () {});

      expect(called).to.eql(false);
    });

  });

});
