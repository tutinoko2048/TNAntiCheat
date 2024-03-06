import { world } from '@minecraft/server';
import { BaseModule } from './BaseModule';
import { createCache } from 'util/PlayerCache';

const breakCount = createCache<number>();

export const module = new BaseModule();
/*
world.beforeEvents.playerBreakBlock.subscribe(ev => {
  const { player, block } = ev;
  
  breakCount[player.id] ??= 0;
  breakCount[player.id]++;
});
*/
