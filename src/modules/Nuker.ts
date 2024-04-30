import { system, world } from '@minecraft/server';
import { BaseModule } from './BaseModule';
import { createCache } from '@/utils/PlayerCache';

const breakCount = createCache<number>();

const module = new BaseModule('Nuker/A', 'nukerA');
export default module;

world.beforeEvents.playerBreakBlock.subscribe(ev => {
  const { player, block } = ev;
  if (!module.config.enabled) return;
  
  breakCount[player.id] ??= 0;
  breakCount[player.id]++;

  let baseThreshold = module.config.limit;
  
  if (breakCount[player.id] >= baseThreshold) {
    if (module.config.cancel) ev.cancel = true;
    return;
  }
});

system.runInterval(() => {
  if (!module.config.enabled) return;
  for (const player of world.getPlayers()) {
    const count = breakCount[player.id] ?? 0;
    if (count >= module.config.limit) {

    }
  }
})