const ID_LENGTH = 4;
const [PUSH_EVENT, PULL_EVENT] = [Symbol(), Symbol()];
const DEFAULT_HIGH_WATER_MARK = 32;
const MAX_HIGH_WATER_MARK = 1000;

export default { MAX_HIGH_WATER_MARK, DEFAULT_HIGH_WATER_MARK, PULL_EVENT, PUSH_EVENT, ID_LENGTH };