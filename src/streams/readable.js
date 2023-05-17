'use strict';

const { EventEmitter } = require('node:events');
const { Blob } = require('node:buffer');
const { PULL_EVENT, PUSH_EVENT, DEFAULT_HIGH_WATER_MARK, MAX_HIGH_WATER_MARK } = require('./config');

const exit = async (readable, status) => (await readable.stop(), (readable.status = status));
const toBlob = async (readable, type) => {
  const chunks = [];
  for await (const chunk of readable) chunks.push(chunk);
  return new Blob(chunks, { type });
};

const checkStreamLimits = stream => {
  // increase queue if source is much faster than reader implement remote backpressure to resolve
  if (stream.listenerCount(PULL_EVENT) >= maxListenersCount) ++highWaterMark;
  if (highWaterMark > MAX_HIGH_WATER_MARK) throw new Error('Stream overflow occurred');
};

const pull = stream => {
  const data = queue.shift();
  bytesRead += data.length;
  stream.emit(PULL_EVENT);
  return data;
};

const createReadable = EventEmitter => (id, name, size, options) => {
  let highWaterMark = options.highWaterMark ?? DEFAULT_HIGH_WATER_MARK;
  const maxListenersCount = EventEmitter.getMaxListeners() - 1;
  let streaming = false;
  let bytesRead = 0;
  const queue = [];

  class Readable extends EventEmitter {
    status = 'active';
    #maxListenersCount = this.getMaxListeners() - 1;

    close = exit.bind(null, this, 'closed');
    terminate = exit.bind(null, this, 'terminated');
    toBlob = toBlob.bind(null, this);
    pipe = writable => (this.finalize(writable), writable);

    push = async data => {
      if (queue.length > highWaterMark) {
        checkStreamLimits(this);
        await EventEmitter.once(this, PULL_EVENT);
        return this.push(data);
      }

      queue.push(data);
      if (queue.length === 1) this.emit(PUSH_EVENT);
      return data;
    };

    finalize = async writable => {
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
    };

    stop = async () => {
      while (bytesRead !== this.size) await EventEmitter.once(this, PULL_EVENT);
      streaming = false;
      this.emit(PUSH_EVENT, null);
    };

    read = async () => {
      if (queue.length > 0) return this.pull();
      const finisher = await EventEmitter.once(this, PUSH_EVENT);
      if (finisher === null) return null;
      return this.pull();
    };

    pull = pull.bind(this);

    // async *[Symbol.asyncIterator]() {
    //   while (streaming) {
    //     const chunk = await this.read();
    //     if (!chunk) return;
    //     yield chunk;
    //   }
    // }
  }

  return new Readable();
};

module.exports = createReadable;
