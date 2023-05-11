'use strict';

const { EventEmitter } = require('events');
const { chunkEncode } = require('./chunk');

class CustomWritable extends EventEmitter {
  #transport;

  constructor(id, name, size, transport) {
    super();
    this.id = id;
    this.name = name;
    this.size = size;
    this.#transport = transport;
    this.#open();
  }

  #open = () => {
    const { id, name, size } = this;
    const packet = { type: 'stream', id, name, size };
    this.#transport.send(JSON.stringify(packet));
  };

  write = data => {
    const chunk = chunkEncode(this.id, data);
    this.#transport.send(chunk);
    return true;
  };

  end = () => void this.#transport.send(JSON.stringify({ type: 'stream', id: this.id, status: 'end' }));
  terminate = () => void this.#transport.send(JSON.stringify({ type: 'stream', id: this.id, status: 'terminate' }));
}

module.exports = { CustomWritable };
