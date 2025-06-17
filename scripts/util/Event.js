export class Event {
  constructor() {
    this.beforeListeners = new Set();
    this.listeners = new Set();
  }

  onBefore(listener) {
    this.beforeListeners.add(listener);
    return this;
  }

  on(listener) {
    this.listeners.add(listener);
    return this;
  }

  onceBefore(listener) {
    const wrapper = (...args) => {
      this.offBefore(wrapper);
      listener(...args);
    }
    this.beforeListeners.add(wrapper);
    return this;
  }

  once(listener) {
    const wrapper = (...args) => {
      this.off(wrapper);
      listener(...args);
    }
    this.listeners.add(wrapper);
    return this;
  }

  offBefore(listener) {
    this.beforeListeners.delete(listener);
    return this;
  }
  
  off(listener) {
    this.listeners.delete(listener);
    return this;
  }

  emit(...args) {
    let canceled = false;
    for (const listener of this.beforeListeners) {
      if (listener(...args) === false) {
        canceled = true;
        break;
      }
    }

    if (canceled) return false;

    for (const listener of this.listeners) {
      listener(...args);
    }

    return true;
  }

  removeAllListeners() {
    this.beforeListeners.clear();
    this.listeners.clear();
    return this;
  }
}
