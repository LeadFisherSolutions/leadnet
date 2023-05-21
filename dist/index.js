import Net from './transport';
import EventEmitter from './events';

class NetUnit extends EventEmitter {
  emit = (...args) => void (super.emit('*', ...args), super.emit(...args));
}

export default { Net, NetUnit };
