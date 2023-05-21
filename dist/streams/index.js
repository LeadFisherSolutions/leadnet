import Readable from './Readable';
import Writeable from './Writeable';
import { ID_LENGTH } from '../config/stream.config';

const encode = (id, payload) => {
  const chunk = new Uint8Array(ID_LENGTH + payload.length);
  const view = new DataView(chunk.buffer);
  view.setInt32(0, id);
  chunk.set(payload, ID_LENGTH);
  return chunk;
};

const decode = chunk => {
  const view = new DataView(chunk.buffer);
  const id = view.getInt32(0);
  const payload = chunk.subarray(ID_LENGTH);
  return { id, payload };
};

const from = async (readable, type = '') => {
  const chunks = [];
  for await (const chunk of readable) chunks.push(chunk);
  return new Blob(chunks, { type });
};

const uploader = (writable, blob) => ({
  id: writable.id,
  upload: async () => {
    const reader = blob.stream().getReader();
    let chunk;
    while (!(chunk = await reader.read()).done) writable.write(chunk.value);
    writable.end();
  },
});

export default { Readable, Writeable, chunk: { encode, decode }, blob: { from, uploader } };
