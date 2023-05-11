'use strict';

const { HEADERS, MIME_TYPES, TOKEN, COOKIE_HOST, COOKIE_DELETE } = require('./config');
const Transport = require('./transport');

const parseHost = host => {
  if (!host) return '';
  const portOffset = host.indexOf(':');
  if (portOffset > -1) host = host.substr(0, portOffset);
  return host;
};

const parseCookies = cookie => {
  const values = [];
  const items = cookie.split(';');
  for (const item of items) {
    const [key, val = ''] = item.split('=');
    values.push([key.trim(), val.trim()]);
  }
  return Object.fromEntries(values);
};

class HTTPTransport extends Transport {
  constructor(server, req, res) {
    super(server, req);
    this.res = res;
    if (req.method === 'OPTIONS') this.options();
    req.on('close', () => void this.emit('close'));
  }

  write = (data, code = 200, ext = 'json') => {
    const { res } = this;
    if (res.writableEnded) return;
    const mimeType = MIME_TYPES[ext] || MIME_TYPES.html;
    res.writeHead(code, { ...HEADERS, 'Content-Type': mimeType });
    res.end(data);
  };

  redirect = (location, code = 302) => {
    const { res } = this;
    if (res.headersSent) return;
    res.writeHead(code, { Location: location, ...HEADERS }), res.end();
  };

  getCookies = () => {
    const { cookie } = this.req.headers;
    if (!cookie) return {};
    return parseCookies(cookie);
  };

  sendSessionCookie = token => {
    const host = parseHost(this.req.headers.host);
    const cookie = `${TOKEN}=${token}; ${COOKIE_HOST}=${host}`;
    this.req.setHeader('Set-Cookie', cookie);
  };

  removeSessionCookie = () => {
    const host = parseHost(this.req.headers.host);
    this.req.setHeader('Set-Cookie', COOKIE_DELETE + host);
  };

  options = () => {
    const { res } = this;
    if (res.headersSent) return;
    res.writeHead(200, HEADERS), res.end();
  };

  close = () => {
    this.error(503), this.req.connection.close();
  };
}

module.exports = { HTTPTransport };
