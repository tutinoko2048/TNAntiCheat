import { system, Player } from '@minecraft/server';
import { Util } from '../util/util';
import { killDroppedItem } from './util';
import config from '../config.js';

export function reachA(ev) { // attacking
  if (!config.reachA.state) return;
  const { entity, hitEntity } = ev;
  if (!hitEntity || !(entity instanceof Player) || Util.isCreative(entity) || Util.isOP(entity)) return;
  if (
    (config.reachA.excludeCustomEntities && !hitEntity.typeId.startsWith('minecraft:')) ||
    config.reachA.excludeEntities.includes(hitEntity.typeId)
  ) return;
  
  const distance = Util.distance(entity.headLocation, hitEntity.location);
  if (distance > config.reachA.maxReach)
    entity.reachAFlag = `長いリーチの攻撃を検知しました (${hitEntity.typeId}, length: ${distance.toFixed(2)})`;
}

export function reachB(ev) { // placement
  if (!config.reachB.state) return;
  const { source, blockLocation } = ev;
  if (!(source instanceof Player) || Util.isCreative(source) || Util.isOP(source)) return;
  const distance = Util.distance(source.headLocation, blockLocation);
  if (distance > config.reachB.maxReach) {
    source.reachBFlag = `長いリーチの設置を検知しました (length: ${distance.toFixed(2)})`;
    if (config.reachB.cancel) ev.cancel = true;
  }
}

export function reachC(ev) { // destruction
  if (!config.reachC.state) return;
  const { player, block, brokenBlockPermutation } = ev;
  if (Util.isCreative(player) || Util.isOP(player)) return;
  const distance = Util.distance(player.headLocation, block.location);
  if (distance > config.reachC.maxReach) {
    player.reachCFlag = `長いリーチの破壊を検知しました (length: ${distance.toFixed(2)})`;
    system.run(() => {
      killDroppedItem(block.location, block.dimension);
      if (config.reachC.cancel) block.setPermutation(brokenBlockPermutation);
    }); // 1tick delay
  }
}

export function autoClicker(ev) {
  const { entity, hitEntity } = ev;
  if (!config.autoClicker.state || !hitEntity || !(entity instanceof Player) || Util.isOP(entity)) return;
  entity.cps ??= [];
  
  const time = Date.now() - entity.lastHitAt;
  if (entity.lastHitAt && 1 < time && time < 500) {
    const cps = 1000 / time;
    if (cps === Infinity) return;
    if (entity.cps.length > 4) entity.cps.shift();
    entity.cps.push(cps);
    const avg = Util.average(entity.cps);
    if (entity.cps.length > 1 && avg > config.autoClicker.maxCPS)
      entity.autoClickerFlag = `高いCPSを検知しました (${avg.toFixed(1)}clicks/s)`;
  }
  entity.lastHitAt = Date.now();
}