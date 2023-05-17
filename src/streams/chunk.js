'use strict';

const { ID_LENGTH } = require('../../config/stream.config.js');

const decode = chunk => {
  const view = new DataView(chunk.buffer);
  const id = view.getInt32(0);
  const payload = chunk.subarray(ID_LENGTH);
  return { id, payload };
};

const encode = (id, payload) => {
  const chunk = new Uint8Array(ID_LENGTH + payload.length);
  const view = new DataView(chunk.buffer);
  view.setInt32(0, id);
  chunk.set(payload, ID_LENGTH);
  return chunk;
};

module.exports = { decode, encode };
