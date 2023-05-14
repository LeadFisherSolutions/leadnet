'use strict';

const EventEmitter = require('./events');

class CustomError extends Error {
  constructor({ message, code }) {
    super(message);
    this.code = code;
  }
}

class Unit extends EventEmitter {
  emit(...args) {
    super.emit('*', ...args);
    super.emit(...args);
  }
}

module.exports = { CustomError, Unit };
