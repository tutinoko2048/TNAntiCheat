import { world, system } from '@minecraft/server';
import { BaseEventSignal } from './BaseEventSignal';

let loaded = false;

export class WorldLoadEvent {
  #state;
  
  constructor(state) {
    this.#state = state;
  }
  
  get state() {
    return this.#state;
  }
}

export class WorldLoadEventSignal extends BaseEventSignal {
  constructor() {
    super();
    
    const run = system.runSchedule(() => {
      world.getDimension('overworld').runCommandAsync('testfor @a').then(() => {
        if (loaded) return;
        this.callbacks.forEach(fn => fn(new WorldLoadEvent(true)));
        loaded = true;
        
        system.clearRunSchedule(run);
      });
    });
  }
}