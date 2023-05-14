'use strict';

const { randomUUID } = require('node:crypto');

const createProxy = (data, save) =>
  new Proxy(data, {
    get: (data, key) => Reflect.get(data, key),
    set: (data, key, value) => {
      const res = Reflect.set(data, key, value);
      save && save(data);
      return res;
    },
  });

function Session(token, data, { application, console }) {
  this.token = token;
  this.state = createProxy(data, data => void application.auth.saveSession(token, data).catch(console.error));
}

function Context(client) {
  this.client = client;
  this.uuid = randomUUID();
  this.state = {};
  this.session = client?.session ?? null;
}

module.exports = { createProxy, Session, Context };
