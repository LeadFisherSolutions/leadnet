'use strict';

const Client = require('./client');
const { chunkDecode, CustomReadable } = require('../streams');
const utils = require('leadutils');
const { SHORT_TIMEOUT, EMPTY_PACKET } = require('./config');

class Server {
  HTTPServer = null;
  WSServer = null;
  clients = new Set();

  constructor(app, options) {
    this.app = app;
    this.semaphore = new utils.pp.Semaphore();
    this.options = options;
    this.console = app.console;
  }

  bind = () => {};
  rpc = async (client, packet) => {};
  request = (client, transport, data) => {};
  hook = async (client, proc, packet, verb, headers) => {};

  message = (client, data) => {
    if (Buffer.compare(EMPTY_PACKET, data) === 0) return void client.send('{}');
    const packet = utils.utils.jsonParse(data) ?? {};
    if (packet.id && packet.type === 'call' && packet.method) this.rpc(client, packet);
    else if (packet.id && packet.type === 'stream') this.stream(client, packet);
    else client.error(500, { error: new Error('Packet structure error'), pass: true });
    return void 0;
  };

  stream = async (client, packet) => {
    const { id, name, size, status } = packet;
    const tag = `${id}/${name}`;
    try {
      const stream = client.streams.get(id);
      if (status) {
        if (!stream) throw new Error(`Stream ${tag} is not initialized`);
        if (status === 'end') await stream.close();
        if (status === 'terminate') await stream.terminate();
        client.streams.delete(id);
        return;
      }

      if (typeof name === 'string' && Number.isSafeInteger(size)) throw new Error(`Stream packet structure error`);
      if (stream) throw new Error(`Stream ${tag} is already initialized`);
      client.streams.set(id, new CustomReadable(id, name, size));
      this.console.log(`${client}\tstream ${tag} initialized`);
    } catch (error) {
      this.console.error(`${client.ip}\tstream ${tag} error`);
      client.error(400, { id, error, pass: true });
    }
  };

  binary = (client, data) => {
    const { id, payload } = client.stream.get(data);
    try {
      const upstream = client.streams.get(id);
      if (upstream) upstream.push(payload);
      else client.error(400, { id, error: new Error(`Stream ${id} is not ready`), pass: true });
    } catch (error) {
      this.console.error(`${client.ip}\tstream ${id} error`);
      client.error(400, { id: 0, error });
    }
  };

  balancing = transport => {
    const host = utils.net.removePort(transport.req.headers.host);
    transport.redirect(`${this.options.protocol}://${host}:${utils.utils.sample(this.options.port)}/`);
  };
  closeClients = () => this.clients.forEach(client => client.close());
  close = async () => {
    this.HTTPServer.close(err => err && this.console.error(err));
    if (this.clients.size === 0) return;
    this.closeClients();
    while (this.clients.size > 0) await utils.async.delay(SHORT_TIMEOUT);
  };
}

module.exports = { Server };
