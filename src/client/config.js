'ues strict';

const utils = require('leadutils');

const CALL_TIMEOUT = utils.time.duration('7s');
const PING_INTERVAL = utils.time.duration('1m');
const RECONNECT_TIMEOUT = utils.time.duration('2s');
const CONNECTIONS = new Set();

module.exports = { CALL_TIMEOUT, PING_INTERVAL, RECONNECT_TIMEOUT, CONNECTIONS };
