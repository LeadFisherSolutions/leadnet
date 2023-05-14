const Net = require('./net');
const Http = require('./http');
const Ws = require('./ws');

Net.transport.ws = Ws;
Net.transport.http = Http;

module.exports = Net;
