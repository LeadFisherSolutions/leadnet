'use strict';

const test = require('node:test');
const { EventEmitter } = require('..');

test('EventEmitter polyfill', async () => {
  const emitter = new EventEmitter();
  await new Promise((resolve, reject) => {
    emitter.on('customEvent', data => {
      if (data === 'test') resolve();
      reject('data !== "test"');
    });
    emitter.emit('customEvent', 'test');
  });
});
