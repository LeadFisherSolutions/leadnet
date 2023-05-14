'use strict';

const SHORT_TIMEOUT = 500;
const EMPTY_PACKET = Buffer.from('{}');
const SESSIONS = new Map(); // token: Session

module.exports = { SHORT_TIMEOUT, EMPTY_PACKET, SESSIONS };
