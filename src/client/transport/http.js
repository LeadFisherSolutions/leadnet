'use strict';

const Net = require('./net');
const DEFAULT_METHOD = 'POST';
const DEFAULT_TYPE = 'application/json';

class HttpTransport extends Net {
  open = async () => {
    this.active = true;
    this.connected = true;
    this.emit('open');
  };

  close = () => {
    this.active = false;
    this.connected = false;
  };

  send = data => {
    this.lastActivity = new Date().getTime();
    fetch(this.url, { method: DEFAULT_METHOD, headers: { 'Content-Type': DEFAULT_TYPE }, body: data })
      .then(res => res.text())
      .then(packet => this.message(packet));
  };
}

module.exports = HttpTransport;
