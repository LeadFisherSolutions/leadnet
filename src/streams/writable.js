'use strict';

const EventEmitter = require('node:events');
const chunk = require('./utils');

const status = (transport, id) => status => () => void transport.send(JSON.stringify({ type: 'stream', id, status }));
const write = (transport, id) => data => (transport.send(chunk.encode(id, data)), true);

class Writable extends EventEmitter {
  constructor(id, name, size, transport) {
    super();
    const statusSender = status(transport, id);
    this.write = write(transport, id);
    this.end = statusSender('end');
    [this.end, this.terminate] = [statusSender('end'), statusSender('terminate')];
    this.terminate = statusSender('terminate');
    transport.send(JSON.stringify({ type: 'stream', id, name, size }));
  }
}

module.exports = Writable;
