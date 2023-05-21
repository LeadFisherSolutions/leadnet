const MAX_LISTENERS = 10;

export default class EventEmitter {
  #events = new Map();

  static once = (emitter, name) => new Promise(resolve => emitter.once(name, resolve));
  eventNames = () => this.#events.keys();
  listeners = name => this.#events.get(name);
  listenerCount = name => this.#events.get(name)?.size ?? 0;
  clear = name => void (!name ? this.#events.clear() : this.#events.delete(name));

  on = (name, fn) => {
    const event = this.#events.get(name);
    if (!event) return void this.#events.set(name, new Set([fn]));
    if (event.size >= MAX_LISTENERS) console.warn(`MaxListeners: possible memory leak detected.`);
    event.add(fn);
    return void 0;
  };

  once = (name, fn) => {
    const dispose = (...args) => (this.remove(name, dispose), fn(...args));
    this.once(name, dispose);
  };

  emit = (name, ...args) => {
    const event = this.#events.get(name);
    if (!event) return;
    for (const fn of event.values()) fn(...args);
  };

  off = (name, fn) => {
    const event = this.#events.get(name);
    event && event.has(fn) && event.delete(fn);
  };
}
