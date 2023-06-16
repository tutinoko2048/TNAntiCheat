import { system, Player, Vector } from '@minecraft/server';
import { Util } from '../util/util';
import { killDroppedItem } from './util';
import config from '../config.js';

/** @param {import('@minecraft/server').EntityHitEntityAfterEvent} ev */
export function reachA(ev) { // attacking
  if (!config.reachA.state) return;
  const { damagingEntity: attacker, hitEntity } = ev;
  if (!hitEntity || !(attacker instanceof Player) || Util.isCreative(attacker) || Util.isOP(attacker)) return;
  if (
    (config.reachA.excludeCustomEntities && !hitEntity.typeId.startsWith('minecraft:')) ||
    config.reachA.excludeEntities.includes(hitEntity.typeId)
  ) return;
  
  const distance = Vector.distance(attacker.getHeadLocation(), hitEntity.location);
  if (distance > config.reachA.maxReach)
    attacker.reachAFlag = `長いリーチの攻撃を検知しました §7(${hitEntity.typeId}, distance: ${distance.toFixed(2)})§r`;
}

/** @param {import('@minecraft/server').ItemUseOnBeforeEvent} ev */
export function reachB(ev) { // placement
  if (!config.reachB.state) return;
  const { source, block } = ev;
  
  if (!(source instanceof Player) || Util.isCreative(source) || Util.isOP(source)) return;
  const distance = Vector.distance(source.getHeadLocation(), block.location);
  if (distance > config.reachB.maxReach) {
    if (config.reachB.cancel) ev.cancel = true;
    source.reachBFlag = `長いリーチの設置を検知しました §7(distance: ${distance.toFixed(2)})§r`;
  }
}

/** @param {import('@minecraft/server').BlockBreakAfterEvent} ev */
export function reachC(ev) { // destruction
  if (!config.reachC.state) return;
  const { player, block, brokenBlockPermutation } = ev;
  if (Util.isCreative(player) || Util.isOP(player)) return;
  
  const distance = Vector.distance(player.getHeadLocation(), block.location);
  if (distance > config.reachC.maxReach) {
    player.reachCFlag = `長いリーチの破壊を検知しました §7(distance: ${distance.toFixed(2)})§r`;
    system.run(() => {
      killDroppedItem(block.location, block.dimension);
      if (config.reachC.cancel) block.setPermutation(brokenBlockPermutation);
    }); // 1tick delay
  }
}

/** @param {import('@minecraft/server').EntityHitEntityAfterEvent} ev */
export function autoClicker(ev) {
  const { damagingEntity: attacker, hitEntity } = ev;
  if (!config.autoClicker.state || !hitEntity || !(attacker instanceof Player) || Util.isOP(attacker)) return;
  attacker.cps ??= [];
  
  const time = Date.now() - attacker.lastHitAt;
  if (attacker.lastHitAt && 1 < time) {
    const cps = 1000 / time;
    if (cps === Infinity) return;
    if (attacker.cps.length > 5) attacker.cps.shift();
    attacker.cps.push(cps);
    const avg = Util.median(attacker.cps);
    if (attacker.cps.length > 3 && avg > config.autoClicker.maxCPS) {
      attacker.autoClickerFlag = `高いCPSを検知しました §7(${avg.toFixed(1)}clicks/s)§r`;
      attacker.cps = [];
    }
  }
  attacker.lastHitAt = Date.now();
}