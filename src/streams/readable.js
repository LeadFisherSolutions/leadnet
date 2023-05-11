'use strict';

const { EventEmitter } = require('events');
const { PULL_EVENT, PUSH_EVENT, DEFAULT_HIGH_WATER_MARK, MAX_HIGH_WATER_MARK } = require('./config');

class CustomReadable extends EventEmitter {
  #bytesRead = 0;
  // #status = 'active';
  #streaming = true;
  #maxListenersCount = this.getMaxListeners() - 1;
  #queue = [];
  #highWaterMark;

  constructor(id, name, size, options) {
    super();
    this.id = id;
    this.name = name;
    this.size = size;
    this.#highWaterMark = options?.highWaterMark ?? DEFAULT_HIGH_WATER_MARK;
  }

  push = async data => {
    if (this.#queue.length > this.#highWaterMark) {
      this.checkStreamLimits();
      await EventEmitter.once(this, PULL_EVENT);
      return this.push(data);
    }
    this.#queue.push(data);
    if (this.#queue.length === 1) this.emit(PUSH_EVENT);
    return data;
  };

  async finalize(writable) {
    const waitWritableEvent = EventEmitter.once.bind(writable);
    const onError = () => this.terminate();
    writable.once('error', onError);
    for await (const chunk of this) {
      const needDrain = !writable.write(chunk);
      if (needDrain) await waitWritableEvent('drain');
    }
    this.emit('end');
    writable.end();
    await waitWritableEvent('close');
    await this.close();
    writable.removeListener('error', onError);
  }

  pipe = writable => (this.finalize(writable), writable);

  async toBlob(type = '') {
    const chunks = [];
    for await (const chunk of this) chunks.push(chunk);
    return new Blob(chunks, { type });
  }

  async close() {
    await this.stop();
    // this.#status = 'closed';
  }

  async terminate() {
    await this.stop();
    // this.#status = 'terminated';
  }

  async stop() {
    while (this.#bytesRead !== this.size) await EventEmitter.once(this, PULL_EVENT);
    this.#streaming = false;
    this.emit(PUSH_EVENT, null);
  }

  async read() {
    if (this.#queue.length > 0) return this.pull();
    const finisher = await EventEmitter.once(this, PUSH_EVENT);
    if (finisher === null) return null;
    return this.pull();
  }

  pull() {
    const data = this.#queue.shift();
    this.#bytesRead += data.length;
    this.emit(PULL_EVENT);
    return data;
  }

  checkStreamLimits() {
    // increase queue if source is much faster than reader implement remote backpressure to resolve
    if (this.listenerCount(PULL_EVENT) >= this.#maxListenersCount) ++this.#highWaterMark;
    if (this.#highWaterMark > MAX_HIGH_WATER_MARK) throw new Error('Stream overflow occurred');
  }

  async *[Symbol.asyncIterator]() {
    while (this.#streaming) {
      const chunk = await this.read();
      if (!chunk) return;
      yield chunk;
    }
  }
}

module.exports = { CustomReadable };
