import { ID_LENGTH } from 'src/streams/config.js';
import { EventEmitter } from './events.js';

export class NetError extends Error {
  constructor({ message, code }) {
    super(message);
    this.code = code;
  }
}

export class NetUnit extends EventEmitter {
  emit = (...args) => (super.emit('*', ...args), super.emit(...args));
}

const encode = (id, payload) => {
  const chunk = new Uint8Array(ID_LENGTH + payload.length);
};

export const chunk = {};
