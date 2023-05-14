'use strict';

const { EventEmitter } = require('node:events');
const { CustomWritable } = require('../streams');
const { SESSIONS } = require('./config');
const { Session, Context } = require('./utils');

class Client extends EventEmitter {
  #streamId = 0;
  #transport;
  session = null;

  constructor(transport) {
    super();
    this.#transport = transport;
    this.ip = transport.ip;
    transport.server.clients.add(this);
    transport.on('close', () => {
      this.destroy();
      transport.server.clients.delete(this);
    });
  }

  error = (code, options) => void this.#transport.error(code, options);
  send = (obj, code) => void this.#transport.send(obj, code);
  createContext = () => new Context(this);
  emit = (name, data) => void (name === 'close' ? super.emit : this.#transport.sendEvent)(name, data);
  close = () => this.#transport.close();

  sendEvent = (name, data) => {
    if (!this.#transport.connection) throw new Error("Can't send event to http transport");
    this.send({ type: 'event', name, data });
  };

  getStream = id => {
    if (!this.#transport.connection) throw new Error("Can't send event to http transport");
    const stream = this.#transport.streams.get(id);
    if (stream) return stream;
    throw new Error(`Stream ${id} not found`);
  };

  createStream = (name, size) => {
    if (!this.#transport.connection) throw new Error("Can't send event to http transport");
    if (!name || !size) throw new Error('Stream name and size must be provided');
    return new CustomWritable(--this.#streamId, name, size, this.#transport.connection);
  };

  sessionInit = (token, data = {}) => {
    this.sessionEnd();
    this.session = new Session(token, data, this.#transport.server);
    return SESSIONS.set(token, this.session), true;
  };

  sessionEnd = () => {
    if (!this.session) return false;
    SESSIONS.delete(this.session.token);
    this.session = null;
    return true;
  };

  sessionStart = (token, data) => {
    this.sessionInit(token, data), !this.#transport.connection && this.#transport.sendSessionCookie(token);
    return true;
  };

  restoreSession = token => {
    const session = SESSIONS.get(token);
    if (!session) return false;
    this.session = session;
    return true;
  };

  destroy = () => {
    this.emit('close');
    if (!this.session) return;
    SESSIONS.delete(this.session.token);
  };
}

module.exports = Client;
