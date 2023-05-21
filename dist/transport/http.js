import Net from './net';

const DEFAULT_METHOD = 'POST';
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

export default class HTTPTransport extends Net {
  open = async () => ((this.active = true), (this.connected = true), this.emit('open'));
  close = () => ((this.active = false), (this.connected = false));
  send = data => {
    this.activity = new Date().getTime();
    fetch(this.url, { method: DEFAULT_METHOD, headers: DEFAULT_HEADERS, body: data })
      .then(res => res.text())
      .then(packet => this.message(packet));
  };
}
