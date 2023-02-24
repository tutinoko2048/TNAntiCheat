import { system, Player, Vector } from '@minecraft/server';
import { Util } from '../util/util';
import { killDroppedItem } from './util';
import config from '../config.js';

// entityHit
export function reachA(ev) { // attacking
  if (!config.reachA.state) return;
  const { entity, hitEntity } = ev;
  if (!hitEntity || !(entity instanceof Player) || Util.isCreative(entity) || Util.isOP(entity)) return;
  if (
    (config.reachA.excludeCustomEntities && !hitEntity.typeId.startsWith('minecraft:')) ||
    config.reachA.excludeEntities.includes(hitEntity.typeId)
  ) return;
  
  const distance = Vector.distance(entity.getHeadLocation(), hitEntity.location);
  if (distance > config.reachA.maxReach)
    entity.reachAFlag = `長いリーチの攻撃を検知しました §7(${hitEntity.typeId}, length: ${distance.toFixed(2)})§r`;
}

// beforeItemUseOn
export function reachB(ev) { // placement
  if (!config.reachB.state) return;
  const { source } = ev;
  
  if (!(source instanceof Player) || Util.isCreative(source) || Util.isOP(source)) return;
  const distance = Vector.distance(source.getHeadLocation(), ev.getBlockLocation());
  if (distance > config.reachB.maxReach) {
    source.reachBFlag = `長いリーチの設置を検知しました §7(length: ${distance.toFixed(2)})§r`;
    if (config.reachB.cancel) ev.cancel = true;
  }
}

// blockBreak
export function reachC(ev) { // destruction
  if (!config.reachC.state) return;
  const { player, block, brokenBlockPermutation } = ev;
  if (Util.isCreative(player) || Util.isOP(player)) return;
  
  const distance = Vector.distance(player.getHeadLocation(), block.location);
  if (distance > config.reachC.maxReach) {
    player.reachCFlag = `長いリーチの破壊を検知しました §7(length: ${distance.toFixed(2)})§r`;
    system.run(() => {
      killDroppedItem(block.location, block.dimension);
      if (config.reachC.cancel) block.setPermutation(brokenBlockPermutation);
    }); // 1tick delay
  }
}

// entityHit
export function autoClicker(ev) {
  const { entity, hitEntity } = ev;
  if (!config.autoClicker.state || !hitEntity || !(entity instanceof Player) || Util.isOP(entity)) return;
  entity.cps ??= [];
  
  const time = Date.now() - entity.lastHitAt;
  if (entity.lastHitAt && 1 < time) {
    const cps = 1000 / time;
    if (cps === Infinity) return;
    if (entity.cps.length > 5) entity.cps.shift();
    entity.cps.push(cps);
    const avg = Util.median(entity.cps);
    if (entity.cps.length > 3 && avg > config.autoClicker.maxCPS) {
      entity.autoClickerFlag = `高いCPSを検知しました §7(${avg.toFixed(1)}clicks/s)§r`;
      entity.cps = [];
    }
  }
  entity.lastHitAt = Date.now();
}