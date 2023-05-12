'use strict';

const { Client } = require('./client');

class Server {
  HTTPServer = null;
  WSServer = null;

  constructor(app, options) {
    this.app = app;
    this.options = options;
    this.console = app.console;
  }
}

module.exports = { Server };
