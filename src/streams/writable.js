'use strict';

const chunk = require('./chunk');

const status = (transport, id) => status => () => void transport.send(JSON.stringify({ type: 'stream', id, status }));
const write = (transport, id) => data => (transport.send(chunk.encode(id, data)), true);

const createWritable = EventEmitter => (id, name, size, transport) => {
  const statusSender = status(transport, id);

  class Writable extends EventEmitter {
    write = write(transport, id);
    end = statusSender('end');
    terminate = statusSender('terminate');
  }

  transport.send(JSON.stringify({ type: 'stream', id, name, size }));
  return new Writable();
};

module.exports = createWritable;
