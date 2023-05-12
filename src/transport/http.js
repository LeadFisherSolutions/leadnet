'use strict';

const { HEADERS, MIME_TYPES, TOKEN, COOKIE_HOST, COOKIE_DELETE } = require('./config');
const Transport = require('./transport');
const { net } = require('leadutils');
const { parseCookie, removePort } = net;

class HTTPTransport extends Transport {
  constructor(server, req, res) {
    super(server, req);
    this.res = res;
    if (req.method === 'OPTIONS') this.options();
    req.on('close', () => void this.emit('close'));
  }

  write = (data, code = 200, ext = 'json') => {
    if (this.res.writableEnded) return;
    this.res.writeHead(code, { ...HEADERS, 'Content-Type': MIME_TYPES[ext] || MIME_TYPES.html });
    this.res.end(data);
  };

  redirect = (location, code = 302) => {
    if (this.res.headersSent) return;
    this.res.writeHead(code, { Location: location, ...HEADERS }), this.res.end();
  };

  sendSessionCookie = token =>
    this.req.setHeader('Set-Cookie', `${TOKEN}=${token}; ${COOKIE_HOST}=${removePort(this.req.headers.host)}`);

  getCookies = () => (!this.req.headers.cookie ? {} : parseCookie(this.req.headers.cookie));
  removeSessionCookie = () => void this.req.setHeader('Set-Cookie', COOKIE_DELETE + removePort(this.req.headers.host));
  close = () => void (this.error(503), this.req.connection.close());
  options = () => void (this.res.headersSent ? null : (this.res.writeHead(200, HEADERS), this.res.end()));
}

module.exports = { HTTPTransport };
