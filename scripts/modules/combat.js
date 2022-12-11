import { system, Player, EntityHitEvent, BeforeItemUseOnEvent, BlockBreakEvent, Location } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

export function reach(ev) {
  if (!config.reach.state) return;
  
  if (ev instanceof BeforeItemUseOnEvent) {
    const { source, blockLocation } = ev;
    if (!(source instanceof Player) || Util.isCreative(source) || Util.isOP(source)) return;
    const distance = Util.distance(source.headLocation, blockLocation);
    if (distance > config.reach.blockReach) {
      source.blockReachFlag = `長いリーチを検知しました (length: ${distance.toFixed(2)})`;
      ev.cancel = true;
    }
      
  } else if (ev instanceof BlockBreakEvent) {
    const { player, block, brokenBlockPermutation } = ev;
    if (Util.isCreative(player) || Util.isOP(player)) return;
    const distance = Util.distance(player.headLocation, block.location);
    if (distance > config.reach.blockReach) {
      player.blockReachFlag = `長いリーチを検知しました (length: ${distance.toFixed(2)})`;
      system.run(() => {
        const items = block.dimension.getEntities({
          location: new Location(block.x, block.y, block.z),
          maxDistance: 1.5,
          type: 'minecraft:item'
        });
        for (const i of items) i.kill();
        block.setPermutation(brokenBlockPermutation);
      }); // 1tick delay
    }
    
  } else if (ev instanceof EntityHitEvent) {
    const { entity, hitEntity } = ev;
    if (!hitEntity || !(entity instanceof Player) || Util.isCreative(entity) || Util.isOP(entity)) return;
    if (
      (config.reach.excludeCustomEntities && !hitEntity.typeId.startsWith('minecraft:')) ||
      config.reach.excludeEntities.includes(hitEntity.typeId)
    ) return;
    
    const distance = Util.distance(entity.headLocation, hitEntity.location);
    if (distance > config.reach.attackReach)
      entity.attackReachFlag = `長いリーチを検知しました (${hitEntity.typeId}, length: ${distance.toFixed(2)})`;
  }
}

export function autoClicker(ev) {
  const { entity, hitEntity } = ev;
  if (!config.autoClicker.state || !hitEntity || !(entity instanceof Player) || Util.isOP(entity)) return;
   entity.cps ??= [];
  
  if (entity.lastHitAt && Date.now() - entity.lastHitAt < 1000) {
    const cps = 1000 / (Date.now() - entity.lastHitAt);
    if (cps === Infinity) return;
    if (entity.cps.length > 4) entity.cps.shift();
    entity.cps.push(cps);
    const avg = Util.average(entity.cps);
    if (entity.cps.length > 1 && avg > config.autoClicker.maxCPS)
      entity.autoClickerFlag = `高いCPSを検知しました: §c${avg.toFixed(1)}clicks/s`;
  }
  entity.lastHitAt = Date.now();
}