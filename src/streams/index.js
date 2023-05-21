'use strict';

const Writable = require('./writable');
const Readable = require('./readable');
const utils = require('./utils');

module.exports = { ...utils, stream: { Writable, Readable } };
