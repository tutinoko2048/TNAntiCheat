import { world } from '@minecraft/server';

export class PlayerSpawnEvent {
  #player;
  
  constructor(player) {
    this.#player = player;
  }
  
  get player() {
    return this.#player;
  }
}

export class PlayerSpawnEventSignal {
  #callbacks;
  #joinedPlayers;
  
  constructor() {
    this.#callbacks = new Set();
    this.#joinedPlayers = new Map();

    world.events.playerJoin.subscribe(ev => this.#joinedPlayers.set(ev.player.name, ev.player));
    world.events.playerLeave.subscribe(ev => this.#joinedPlayers.delete(ev.playerName));
    
    world.events.tick.subscribe(() => {
      this.#joinedPlayers.forEach((p, key) => {
        p.runCommandAsync('testfor @s').then(() => {
          this.#callbacks.forEach(fn => fn(new PlayerSpawnEvent(p)));
          this.#joinedPlayers.delete(key);
        });
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