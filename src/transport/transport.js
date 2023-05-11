'use strict';

const http = require('node:http');
const { EventEmitter } = require('node:events');

const UNKNOWN = 'Unknown error';

class Transport extends EventEmitter {
  constructor(server, req) {
    super();
    this.server = server;
    this.req = req;
    this.ip = req.socket.remoteAddress;
  }

  error = (code = 500, { id, error = null, httpCode = null } = {}) => {
    const { server, req, ip } = this;
    const { console } = server;
    const { url, method } = req;
    if (!httpCode) httpCode = (error && error.httpCOde) || code;
    const status = http.STATUS_CODES[httpCode];
    const pass = httpCode < 500 || httpCode > 599;
    const message = pass && error ? error.message : status || UNKNOWN;
    const reason = `${httpCode}\t${code}\t${error ? error.stack : status}`;
    console.error(`${ip}\t${method}\t${url}\t${reason}`);
    const packet = { type: 'callback', id, error: { message, code } };
    this.send(packet, httpCode);
  };

  send = (obj, code = 200) => void this.write(JSON.stringify(obj), code, 'json');
}

module.exports = { Transport };
