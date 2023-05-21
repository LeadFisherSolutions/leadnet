const CALL_TIMEOUT = 7_000;
const PING_INTERVAL = 60_000;
const RECONNECT_TIMEOUT = 2_000;
const CONNECTIONS = new Set();

window.addEventListener('online', () => CONNECTIONS.forEach(net => !net.connected && net.open()));
export default { CALL_TIMEOUT, PING_INTERVAL, RECONNECT_TIMEOUT, CONNECTIONS };
