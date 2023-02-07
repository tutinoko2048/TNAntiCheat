export class BaseEventSignal {
  constructor() {
    this.callbacks = new Set();
  }
  
  subscribe(callback) {
    this.callbacks.add(callback);
    return callback;
  }
  
  unsubscribe(callback) {
    if (!callback) throw Error('callback must be specified.');
    if (!this.callbacks.has(callback)) throw Error('This funtion is not subscribed.');
    this.callbacks.delete(callback);
    return callback;
  }
}

