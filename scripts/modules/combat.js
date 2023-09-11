import { Player, Vector } from '@minecraft/server';
import { Util } from '../util/util';
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

/** @param {import('@minecraft/server').PlayerBreakBlockBeforeEvent} ev */
export function reachC(ev) { // destruction
  if (!config.reachC.state) return;
  const { player, block } = ev;
  if (Util.isCreative(player) || Util.isOP(player)) return;
  
  const distance = Vector.distance(player.getHeadLocation(), block.location);
  if (distance > config.reachC.maxReach) {
    if (config.reachC.cancel) ev.cancel = true;
    player.reachCFlag = `長いリーチの破壊を検知しました §7(distance: ${distance.toFixed(2)})§r`;
    return true;
  }
}

/**
 * @param {Player} player
 * @returns {number}
 */
export function getCPS(player) {
  player.clicks ??= [];
  const now = Date.now();

  // timestamp: [old...new]
  while (player.clicks.length > 0 && now - player.clicks[0] >= 1000) {
    player.clicks.shift();
  }
  return player.clicks.length;
}

/** @param {import('@minecraft/server').EntityHitEntityAfterEvent} ev */
export function autoClickerAttack(ev) {
  if (!config.autoClicker.state) return;
  const { damagingEntity: attacker } = ev;
  if (!(attacker instanceof Player) || Util.isOP(attacker)) return;

  // Autoclicker detection from Paradox Anticheat, thanks!
  const now = Date.now();
  while (attacker.clicks.length > 0 && now - attacker.clicks[0] >= 1000) {
    attacker.clicks.shift();
  }
  attacker.clicks.push(now);
}

/** @param {Player} player */
export function autoClickerCheck(player) {
  const cps = getCPS(player);
  if (cps >= config.autoClicker.maxCPS) {
    player.autoClickerCount ??= 0;
    player.autoClickerCount++;

    //player.autoClickerFlag = `高いCPSを検知しました §7(${cps}clicks/s)§r`;
    if (config.autoClicker.flagCount === -1 || player.autoClickerCount <= config.autoClicker.flagCount) {
      player.flagQueue = `AutoClicker >> §c${player.name}§r §7[${player.autoClickerCount}] (cps: ${cps})§r§　`;
    }
    if (config.autoClicker.flagCount !== -1 && player.autoClickerCount > config.autoClicker.flagCount) {
      Util.flag(
        player, 'AutoClicker', config.autoClicker.punishment,
        `高いCPSを検知しました §7(count: ${player.autoClickerCount}, cps: ${cps})§r`
      );
    }
    player.clicks.length = 0;
  }
}

