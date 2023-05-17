'use strict';

const EventEmitter = require('../../../dist/events');
const { CustomWritable } = require('src/streams');

class Net extends EventEmitter {
  static transport = {};

  constructor(url, options) {
    super();
  }

  static create = (url, options) => new Net.transport[url.startsWith('ws') ? 'ws' : 'http'](url, options);
  createStream = (name, size) => new CustomWritable(++this.id, name, size, this);
  createBlobUploader = blob => {
    const consumer = this.createStreamConsumer(blob.name ?? 'blob', blob.size);
    const upload = async () => {
      const reader = blob.stream().getReader();
      let chunk;
      while (!(chunk = await reader.read()).done) consumer.write(chunk.value);
      consumer.end();
    };
    return { id: consumer.id, upload };
  };

  getStream = id => {
    const stream = this.streams.get(id);
    if (stream) return stream;
    throw new Error(`Stream ${id} not found`);
  };
}

module.exports = Net;
