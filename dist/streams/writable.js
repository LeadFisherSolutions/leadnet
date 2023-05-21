import { chunk } from './utils';
import EventEmitter from './events';

const exit = (transport, id) => status => () => void transport.send(JSON.stringify({ type: 'stream', id, status }));
const write = (transport, id) => data => (transport.send(chunk.encode(id, data)), true);

export default class Writable extends EventEmitter {
  constructor(id, name, size, transport) {
    super();
    const status = exit(transport, id);
    [this.end, this.terminate, this.write] = [status('end'), status('terminate'), write(transport, id)];
    transport.send(JSON.stringify({ type: 'stream', id, name, size }));
  }
}
