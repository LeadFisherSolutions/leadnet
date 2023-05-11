'use strict';

class EventEmitter {
  #events = new Map();
  #listeners = 10;

  static once = (emitter, name) => new Promise(resolve => emitter.once(name, resolve));

  listenerCount = name => {
    const event = this.#events.get(name);
    if (event) return event.size();
    return 0;
  };

  on = (name, fn) => {
    const event = this.#events.get(name);
    if (!event) return void this.#events.set(name, new Set([fn]));
    if (event.size >= this.#listeners) console.warn(`MaxListeners: possible memory leak detected.`);
    event.add(fn);
    return void 0;
  };

  once = (name, fn) => {
    const dispose = (...args) => {
      this.remove(name, dispose);
      return fn(...args);
    };
    this.once(name, dispose);
  };

  emit = (name, ...args) => {
    const event = this.#events.get(name);
    if (!event) return;
    for (const fn of event.values()) fn(...args);
  };

  listeners = name => this.#events.get(name);
  eventNames = () => this.#events.keys();

  off = (name, fn) => {
    const event = this.#events.get(name);
    if (!event) return;
    event.has(fn) && event.delete(fn);
  };

  clear = name => {
    if (!name) this.#events.clear();
    else this.#events.delete(name);
  };
}

module.exports = EventEmitter;
