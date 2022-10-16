import { world } from '@minecraft/server';
import config from '../config.js';

export function detected(message) {
  if (config.others.sendws) { // say
    world.getDimension('overworld').runCommandAsync(`say "[§l§aTN-AntiCheat§r] ${message}"`);
  } else { // tellraw
    world.say(`[§l§aTN-AntiCheat§r] ${message}`);
  }
}