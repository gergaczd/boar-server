'use strict';

let fs = require('fs');
let http = require('http');
let https = require('https');
let serve = require('koa-static');
let cors = require('kcors');
let Pug = require('koa-pug');
let errorHandlerMiddleware = require('./middlewares/error-handler');
let methodOverride = require('koa-methodoverride');
let HookMiddlewareFactory = require('./middlewares/hook');
let bodyparser = require('koa-bodyparser');
let requestId = require('koa-requestid');
let ssl = require('koa-ssl');
let SecurityMiddlewareFactory = require('../lib/security-middleware-factory');


class App {
  constructor(koaApp) {
    this.koaApp = koaApp;
  }

  addCorsSupportMiddleware() {
    this.addMiddleware(cors({
      origin: '*'
    }));
  }

  loadControllers(path) {
    fs.readdirSync(path).forEach(function(file) {
      let filePath = path + '/' + file + '/index.js';
      if (!fs.existsSync(filePath)) {
        return;
      }
      require(filePath)(this.koaApp);
    }.bind(this));
  }

  loadModels(path) {
    fs.readdirSync(path).forEach(function(file) {
      if (/(.*)\.(js$)/.test(file) && !/(.*)\.(spec.js$)/.test(file)) {
        require(path + '/' + file);
      }
    }.bind(this));
  }

  addMiddleware(middleware) {
    this.koaApp.use(middleware);
  }

  addStaticContentMiddleware(path) {
    this.addMiddleware(serve(path));
  }

  addDynamicViewMiddleware(root, cache) {
    let pugMiddleware = new Pug({
      viewPath: root,
      noCache: !cache
    });

    pugMiddleware.use(this.koaApp);
  }

  addHookMiddleware() {
    this.addMiddleware(HookMiddlewareFactory.getMiddleware());
  }

  addMethodOverrideMiddleware(fieldName) {
    this.addMiddleware(methodOverride(fieldName));
  }

  addErrorHandlerMiddleware(renderPath) {
    this.addMiddleware(errorHandlerMiddleware(renderPath));
  }

  addBodyParseMiddleware(options) {
    this.addMiddleware(bodyparser(options));
  }

  addRequestIdMiddleware(options) {
    options = options || { expose: 'x-request-id', header: 'x-request-id', query: 'x-request-id' };
    this.addMiddleware(requestId(options));
  }

  addSecurityMiddlewares(options) {
    new SecurityMiddlewareFactory(options)
      .getMiddlewares()
      .forEach(this.addMiddleware, this);
  }

  addEnforceSSLMiddleware(options) {
    this.addMiddleware(ssl(options));
  }

  listen(port, env) {
    let httpPort = parseInt(port);
    this._startHTTPServer(httpPort, env);

    if (process.env.SERVE_HTTPS === 'true') {
      let httpsPort = httpPort + 10000;
      this._startHTTPSServer(httpsPort, env);
    }
  }

  _startHTTPServer(port, env) {
    http.createServer(this.koaApp.callback()).listen(port);
    console.log('Application started:', { port: port, env: env });
  }

  _startHTTPSServer(port, env) {
    let httpsOptions = {};
    if (process.env.HTTPS_KEY && process.env.HTTPS_CERT) {
      httpsOptions.key = fs.readFileSync(process.env.HTTPS_KEY);
      httpsOptions.cert = fs.readFileSync(process.env.HTTPS_CERT);
    }

    https.createServer(httpsOptions, this.koaApp.callback()).listen(port);
    console.log('Application started (with SSL):', { port: port, env: env });
  }
}

module.exports = App;
