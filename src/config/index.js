'use strict';

const stream = require('./stream.config.js');
const server = require('./server.config.js');
const client = require('./client.config.js');

module.exports = { ...stream, ...server, ...client };
