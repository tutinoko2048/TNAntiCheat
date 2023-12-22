import { Player, Vector } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

const MAX_REACH_THRESHOLD = 30;

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
  if (config.reachA.maxReach < distance && distance < MAX_REACH_THRESHOLD) {
    const deltaLocA = (attacker.lastLocation && Vector.distance(attacker.location, attacker.lastLocation)) ?? 0;
    const deltaLocH = (hitEntity.lastLocation && Vector.distance(hitEntity.location, hitEntity.lastLocation)) ?? 0;
    if (
      deltaLocA < config.reachA.maxReach + 1 &&
      deltaLocH < config.reachA.maxReach + 1
    ) {
      attacker.reachACount ??= 0;
      attacker.reachACount++;
      if (config.reachA.flagCount === -1 || attacker.reachACount <= config.reachA.flagCount) {
        attacker.flagQueue = `Reach/A >> §c${attacker.name}§r §7[${attacker.reachACount}] (d: ${distance.toFixed(1)})§r§ `;
      }
      if (config.reachA.flagCount !== -1 && attacker.reachACount > config.reachA.flagCount) {
        const typeId = hitEntity.typeId.replace('minecraft:', '');
        Util.flag(
          attacker, 'Reach/A', config.reachA.punishment,
          `長いリーチの攻撃を検知しました §7(count: ${attacker.reachACount}, hit: ${typeId}, d: ${distance.toFixed(2)}, dLoc: ${deltaLocA.toFixed(1)})`
        )
      }
    }
  }
}

/** @param {import('@minecraft/server').ItemUseOnBeforeEvent} ev */
export function reachB(ev) { // placement
  if (!config.reachB.state) return;
  const { source, block } = ev;
  
  if (!(source instanceof Player) || Util.isCreative(source) || Util.isOP(source)) return;
  const distance = Vector.distance(source.getHeadLocation(), block.location);
  if (config.reachB.maxReach < distance && distance < MAX_REACH_THRESHOLD) {
    const deltaLoc = (source.lastLocation && Vector.distance(source.location, source.lastLocation)) ?? 0;
    if (deltaLoc < config.reachB.maxReach + 1) {
      if (config.reachB.cancel) ev.cancel = true;

      source.reachBCount ??= 0;
      source.reachBCount++;
      if (config.reachB.flagCount === -1 || source.reachBCount <= config.reachB.flagCount) {
        source.flagQueue = `Reach/B >> §c${source.name}§r §7[${source.reachBCount}] (d: ${distance.toFixed(1)})§r§ `;
      }
      if (config.reachB.flagCount !== -1 && source.reachBCount > config.reachB.flagCount) {
        Util.flag(
          source, 'Reach/B', config.reachB.punishment,
          `長いリーチの設置を検知しました §7(count: ${source.reachBCount}, d: ${distance.toFixed(2)}, dLoc: ${deltaLoc.toFixed(1)})§r§ `
        )
      }
    }
  }
}

/** @param {import('@minecraft/server').PlayerBreakBlockBeforeEvent} ev */
export function reachC(ev) { // destruction
  if (!config.reachC.state) return;
  const { player, block } = ev;
  if (Util.isCreative(player) || Util.isOP(player)) return;
  
  const distance = Vector.distance(player.getHeadLocation(), block.location);
  if (config.reachC.maxReach < distance && distance < MAX_REACH_THRESHOLD) {
    const deltaLoc = (player.lastLocation && Vector.distance(player.location, player.lastLocation)) ?? 0;
    if (deltaLoc < config.reachC.maxReach + 1) {
      if (config.reachC.cancel) ev.cancel = true;

      player.reachCCount ??= 0;
      player.reachCCount++;
      if (config.reachC.flagCount === -1 || player.reachCCount <= config.reachC.flagCount) {
        player.flagQueue = `Reach/C >> §c${player.name}§r §7[${player.reachCCount}] (d: ${distance.toFixed(1)})§r§ `;
      }
      if (config.reachC.flagCount !== -1 && player.reachCCount > config.reachC.flagCount) {
        Util.flag(
          player, 'Reach/C', config.reachC.punishment,
          `長いリーチの破壊を検知しました §7(count: ${player.reachCCount}, d: ${distance.toFixed(2)}, dLoc: ${deltaLoc.toFixed(1)})§r`
        )
      }

      return true;
    }
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
      player.flagQueue = `AutoClicker >> §c${player.name}§r §7[${player.autoClickerCount}] (cps: ${cps})§r§ `;
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

