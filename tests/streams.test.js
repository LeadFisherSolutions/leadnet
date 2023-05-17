'use strict';

const { EventEmitter } = require('events');
// const { Readable } = require('node:stream');
const assert = require('node:assert');
const test = require('node:test');
const utils = require('leadutils');
const { chunk, stream } = require('../src/streams');

const UINT_8_MAX = 255;

const generatePacket = () => ({
  id: utils.utils.random(UINT_8_MAX),
  name: utils.utils.random(UINT_8_MAX).toString(),
  size: utils.utils.random(UINT_8_MAX),
});

const generateDataView = () => {
  const randomString = [...new Array(utils.utils.random(UINT_8_MAX))]
    .map(() => utils.utils.random(UINT_8_MAX))
    .map(num => String.fromCharCode(num))
    .join('');
  return new TextEncoder().encode(randomString);
};

const createWritable = (id, name, size) => {
  const writeBuffer = [];
  const transport = { send: packet => writeBuffer.push(packet) };
  const stream2 = stream.createWritable(EventEmitter)(id, name, size, transport);
  return [stream2, writeBuffer];
};

// const populateStream = stream => ({
//   with: buffer =>
//     Readable.from(buffer)
//       .on('data', chunk => stream.push(chunk))
//       .on('end', () => stream.stop()),
// });

test('[Chunk] encode / decode', () => {
  const { id } = generatePacket();
  const dataView = generateDataView();
  assert.strictEqual(dataView instanceof Uint8Array, true);
  const chunkView = chunk.encode(id, dataView);
  const decoded = chunk.decode(chunkView);
  assert.strictEqual(decoded.id, id);
  assert.notStrictEqual(decoded.payload, dataView);
});

test.test('[Writable] constructor', () => {
  const { id, name, size } = generatePacket();
  const [, writeBuffer] = createWritable(id, name, size);
  assert.strictEqual(writeBuffer.length, 1);
  const packet = writeBuffer.pop();
  assert.strictEqual(typeof packet === 'string', true);
  const parsed = JSON.parse(packet);
  assert.strictEqual(parsed.type, 'stream');
  assert.strictEqual(parsed.id, id);
  assert.strictEqual(parsed.name, name);
  assert.strictEqual(parsed.size, size);
});

test('[Writable] end', () => {
  const { id, name, size } = generatePacket();
  const [writable, writeBuffer] = createWritable(id, name, size);
  assert.strictEqual(writeBuffer.length, 1);
  writable.end();
  assert.strictEqual(writeBuffer.length, 2);
  const packet = writeBuffer.pop();
  assert.strictEqual(typeof packet, 'string');
  const parsed = JSON.parse(packet);
  assert.strictEqual(parsed.type, 'stream');
  assert.strictEqual(parsed.id, id);
  assert.strictEqual(parsed.status, 'end');
});

test('[Writable] terminate', () => {
  const { id, name, size } = generatePacket();
  const [writable, writeBuffer] = createWritable(id, name, size);
  assert.strictEqual(writeBuffer.length, 1);
  writable.terminate();
  assert.strictEqual(writeBuffer.length, 2);
  const packet = writeBuffer.pop();
  assert.strictEqual(typeof packet, 'string');
  const parsed = JSON.parse(packet);
  assert.strictEqual(parsed.type, 'stream');
  assert.strictEqual(parsed.id, id);
  assert.strictEqual(parsed.status, 'terminate');
});

test('[Writable] write: should send encoded packet', () => {
  const { id, name, size } = generatePacket();
  const [writable, writeBuffer] = createWritable(id, name, size);
  const dataView = generateDataView();
  assert.strictEqual(writeBuffer.length, 1);
  const result = writable.write(dataView);
  assert.strictEqual(result, true);
  assert.strictEqual(writeBuffer.length, 2);
  const packet = writeBuffer.pop();
  assert.strictEqual(packet instanceof Uint8Array, true);
  const decoded = chunk.decode(packet);
  assert.strictEqual(decoded.id, id);
  assert.notStrictEqual(decoded.payload, dataView);
});

// test('[Readable] constructor', async () => {
//   const dataView = generateDataView();
//   const { id, name } = generatePacket();
//   const size = dataView.buffer.byteLength;
//   const stream = new CustomReadable(id, name, size);
//   const buffer = Buffer.from(dataView.buffer);
//   populateStream(stream).with(buffer);
//   const chunks = [];
//   for await (const chunk of stream) chunks.push(chunk);
//   const received = Buffer.concat(chunks);
//   assert.notStrictEqual(received, buffer);
// });

// test('[Readable] toBlob', async () => {
//   const dataView = generateDataView();
//   const { id, name } = generatePacket();
//   const size = dataView.buffer.byteLength;
//   const stream = new CustomReadable(id, name, size);
//   const buffer = Buffer.from(dataView.buffer);
//   populateStream(stream).with(buffer);
//   const blob = await stream.toBlob();
//   const arrayBuffer = await blob.arrayBuffer();
//   const received = new Uint8Array(arrayBuffer);
//   assert.notStrictEqual(received, dataView);
// });
