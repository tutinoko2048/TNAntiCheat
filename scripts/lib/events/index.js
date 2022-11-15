import { WorldLoadEventSignal } from './WorldLoadEvent';
import { PlayerSpawnEventSignal } from './PlayerSpawnEvent';

export const events = {
  worldLoad: new WorldLoadEventSignal(),
  playerSpawn: new PlayerSpawnEventSignal()
}