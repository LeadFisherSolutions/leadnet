'use strict';

const ID_LENGTH = 4;
const PUSH_EVENT = Symbol();
const PULL_EVENT = Symbol();
const DEFAULT_HIGH_WATER_MARK = 32;
const MAX_HIGH_WATER_MARK = 1000;

module.exports = { ID_LENGTH, PUSH_EVENT, PULL_EVENT, DEFAULT_HIGH_WATER_MARK, MAX_HIGH_WATER_MARK };
