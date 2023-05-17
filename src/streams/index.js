'use strict';

const createWritable = require('./writable');
const createReadable = require('./readable');
const chunk = require('./chunk');

module.exports = { chunk, stream: { createWritable, createReadable } };
