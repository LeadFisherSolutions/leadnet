'use strict';

const { EventEmitter } = require('node:events');
const { chunkEncode } = require('./chunk');

class CustomWritable extends EventEmitter {
  #transport;

  constructor(id, name, size, transport) {
    super();
    this.id = id;
    this.name = name;
    this.size = size;
    this.#transport = transport;
    this.#transport.send(JSON.stringify({ type: 'stream', id, name, size }));
  }

  write = data => (this.#transport.send(chunkEncode(this.id, data)), true);
  end = () => void this.#transport.send(JSON.stringify({ type: 'stream', id: this.id, status: 'end' }));
  terminate = () => void this.#transport.send(JSON.stringify({ type: 'stream', id: this.id, status: 'terminate' }));
}

module.exports = { CustomWritable };
