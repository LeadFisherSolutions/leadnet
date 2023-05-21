import { CONNECTIONS } from '../config/net.config';
import Net from './net';
const now = () => new Date().getTime();
export default class WSTransport extends Net {
  #opening;
  #ping;

  send = data => !this.connected && ((this.activity = now()), this.socket.send(data));
  close = () => {
    this.active = false;
    CONNECTIONS.delete(this), clearInterval(this.#ping);
    if (this.socket) this.socket = (this.socket.close(), null);
  };

  open = async () => {
    if (this.#opening) return this.#opening;
    if (this.connected) return Promise.resolve();
    const socket = new WebSocket(this.url);
    (this.active = true), (this.socket = socket);
    CONNECTIONS.add(this);

    socket.addEventListener('message', ({ data }) => (typeof data === 'string' ? this.message : this.binary)(data));
    socket.addEventListener('error', err => (this.emit('error', err), socket.close()));
    socket.addEventListener('close', () => {
      (this.#opening = false), (this.connected = false);
      this.emit('close');
      setTimeout(() => this.active && this.open(), this.reconnectTimeout);
    });

    const intervalFn = () => void (this.active && now() - this.activity > this.pingInterval && this.send('{}'));
    this.#ping = setInterval(intervalFn, this.pingInterval);
    this.#opening = new Promise(resolve => {
      const listener = () => void ((this.#opening = null), (this.connected = true), this.emit('open'), resolve());
      socket.addEventListener('open', listener);
    });
    return this.#opening;
  };
}
