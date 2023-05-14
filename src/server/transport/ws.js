'use strict';

const { Transport } = require('./transport');

class WSTransport extends Transport {
  constructor(server, req, connection) {
    super(server, req);
    this.connection = connection;
    connection.on('close', () => void this.emit('close'));
  }

  write = data => void this.connection.send(data);
  close = () => void this.connection.terminate();
}

module.exports = { WSTransport };
