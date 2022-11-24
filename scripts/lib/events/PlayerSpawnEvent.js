import { world, system } from '@minecraft/server';
import { BaseEventSignal } from './BaseEventSignal';

const joinedPlayers = new Map();

export class PlayerSpawnEvent {
  #player;
  
  constructor(player) {
    this.#player = player;
  }
  
  get player() {
    return this.#player;
  }
}

export class PlayerSpawnEventSignal extends BaseEventSignal {
  constructor() {
    super();
    
    world.events.playerJoin.subscribe(({ player }) => joinedPlayers.set(player.name, player));
    world.events.playerLeave.subscribe(({ playerName }) => joinedPlayers.delete(playerName));
    
    system.runSchedule(() => {
      joinedPlayers.forEach((p, key) => {
        p.runCommandAsync('testfor @s').then(() => {
          this.callbacks.forEach(fn => fn(new PlayerSpawnEvent(p)));
          joinedPlayers.delete(key);
        });
      });
    });
  }
}