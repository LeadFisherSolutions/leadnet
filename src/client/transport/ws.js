'use strict';

const { CONNECTIONS } = require('../config');
const Net = require('./net');

class WSTransport extends Net {
  open = async () => {
    if (this.opening) return this.opening;
    if (this.connected) return Promise.resolve();
    const socket = new WebSocket(this.url);
    this.active = true;
    this.socket = socket;
    CONNECTIONS.add(this);

    // prettier-ignore
    socket.addEventListener('message', ({ data }) => void (typeof data === 'string' ? this.message : this.binary)(data));
    socket.addEventListener('error', err => void (this.emit('error', err), socket.close()));
    socket.addEventListener('close', () => {
      this.opening = null;
      this.connected = false;
      this.emit('close');
      setTimeout(() => this.active && this.open(), this.reconnectTimeout);
    });

    this.ping = setInterval(() => {
      if (!this.active) return;
      if (new Date().getTime() - this.lastActivity > this.pingInterval) this.send('{}');
    }, this.pingInterval);

    this.opening = new Promise(resolve => {
      socket.addEventListener('open', () => {
        this.opening = true;
        this.connected = true;
        this.emit('open');
        resolve();
      });
    });

    return this.opening;
  };

  close = () => {
    this.active = false;
    CONNECTIONS.delete(this);
    clearInterval(this.ping);
    if (!this.socket) return;
    this.socket.close();
    this.socket = null;
  };

  send = data => {
    if (!this.connected) return;
    this.lastActivity = new Date().getTime();
    this.socket.send(data);
  };
}

module.exports = { WSTransport };
