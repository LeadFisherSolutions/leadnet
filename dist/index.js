import { CALL_TIMEOUT, PING_INTERVAL, RECONNECT_TIMEOUT, CONNECTIONS } from './config.js';
import { NetError, NetUnit } from './utils.js';
import { EventEmitter } from './events.js';
window.addEventListener('online', () => CONNECTIONS.forEach(net => !net.connected && net.open()));

class Net extends EventEmitter {
  #socket = null;
  #callId = 0;
  #calls = new Map();
  #streams = new Map();
  #active = false;
  #connected = false;
  #opening = false;
  #lastActive = new Date().getTime();
  #ping = null;
  #api = {};

  constructor(url, options) {
    super();
  }

  static create = (url, options) => new (url.startsWith('ws') ? Net.transport.ws : Net.transport.http)(url, options);

  bin = async blob => {
    const buffer = await blob.arrayBuffer();
    const { id, payload } = chunkDecode(new Uint8Array(buffer));
    const stream = this.streams.get(id);
    if (stream) await stream.push(payload);
    else console.warn(`Stream ${id} is not initialized`);
  };

  load = async (...units) => {
    const introspect = this.scaffold('system', 'introspect');
    const introspection = await introspect(units);
    const available = Object.keys(introspection);
    for (const unit of units) {
      if (!available.includes(unit)) continue;
      const request = this.scaffold.bind(this, unit);
      const names = Object.keys(introspection[unit]);
      const methods = names.reduce((acc, name) => ((acc[name] = request(name)), acc), new NetUnit());
      methods.on('*', (event, data) => this.send(JSON.stringify({ type: 'event', name: `${unit}/${event}`, data })));
      this.api[unit] = methods;
    }
  };

  scaffold = (unit, method, ver) => async args => {
    const id = ++this.callId;
    const unitName = unit + (ver ? '.' + ver : '');
    const target = `${unitName}/${method}`;
    if (this.#opening) await this.#opening;
    if (!this.#connected) await this.open();
    return new Promise((resolve, reject) => {
      const callback = () => void this.#calls.has(id) && (this.#calls.delete(id), reject(new Error('Request timeout')));
      const timeout = setTimeout(callback, this.callTimeout);
      this.#calls.set(id, [resolve, reject, timeout]);
      this.send(JSON.stringify({ type: 'call', id, method: target, args: args ?? {} }));
    });
  };
}
