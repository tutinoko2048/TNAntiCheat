import { world } from '@minecraft/server';

export class WorldLoadEvent {
  #state;
  
  constructor(state) {
    this.#state = state;
  }
  
  get state() {
    return this.#state;
  }
}

export class WorldLoadEventSignal {
  #callbacks;
  #loaded;
  
  constructor() {
    this.#callbacks = new Set();
    this.#loaded = false;
    const tick = world.events.tick.subscribe(() => {
      if (this.#loaded) return;
      world.getDimension('overworld').runCommandAsync('testfor @a').then(() => {
        this.#loaded = true;
        this.#callbacks.forEach(fn => fn(new WorldLoadEvent(true)));
        world.events.tick.unsubscribe(tick);
      });
    });
  }
  
  subscribe(callback) {
    this.#callbacks.add(callback);
    return callback;
  }
  
  unsubscribe(callback) {
    if (!callback) throw Error("callback must be specified.");
    if (!this.#callbacks.has(callback)) throw Error("This funtion is not subscribed.");
    this.#callbacks.delete(callback);
    return callback;
  }
}