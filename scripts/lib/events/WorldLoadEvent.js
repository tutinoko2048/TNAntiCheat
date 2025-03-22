import { world, system } from '@minecraft/server';
import { BaseEventSignal } from './BaseEventSignal';

let loaded = false;

export class WorldLoadEvent {
  constructor() {}
}

export class WorldLoadEventSignal extends BaseEventSignal {
  constructor() {
    super();
    
    world.afterEvents.worldLoad.subscribe(() => {
      const run = system.runInterval(() => {
        if (loaded) return;
        if (world.getAllPlayers().length > 0) {
          this.callbacks.forEach(fn => fn(new WorldLoadEvent()));
          loaded = true;
          system.clearRun(run);
        }
      });
    });
  }
}