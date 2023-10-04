import { world, GameMode, EntityRidingComponent } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

/** @typedef {import('@minecraft/server').Player} Player */

const excluded = [ GameMode.creative, GameMode.spectator ];

/** @arg {Player} player */
export function flyA(player) {
  if (!config.flyA.state) return;
  if (player.fallDistance < config.flyA.minFallDistance) {
    if (
      Util.isOP(player) ||
      Date.now() - player.threwTridentAt < 4000 ||
      Date.now() - player.pistonPushedAt < 3000 ||
      (config.flyA.excludeTag && player.hasTag(config.flyA.excludeTag))
    ) return;
    
    player.flyACount ??= 0;
    player.flyACount++;
    const vy = player.getVelocity().y.toFixed(2);
    const distance = player.fallDistance.toFixed(2);
    if (config.flyA.flagCount === -1 || player.flyACount <= config.flyA.flagCount) {
      player.flagQueue = `Fly/A >> §c${player.name}§r §7[${player.flyACount}] (fall: ${distance}, vy: ${vy})§r§　`;
    }
    // rollback
    const loc = player.lastLocation ?? player.location;
    const dimension = world.getDimension(player.lastDimensionId);
    if (config.flyA.rollback) player.teleport(loc, { dimension, rotation: player.getRotation() });
    // flag
    if (config.flyA.flagCount !== -1 && player.flyACount > config.flyA.flagCount) {
      Util.flag(player, 'Fly/A', config.flyA.punishment, `飛行を検知しました §7(count: ${player.flyACount}, fall: ${distance}, vy: ${vy})§r`);
    }
  }
}

/** @arg {Player} player */
export function speedA(player) {
  if (!config.speedA.state) return;
  const { x, z } = player.getVelocity();
  const velocity = Math.sqrt(x ** 2 + z ** 2); // velocity without Y
  const avgVelocity = (velocity + player.lastVelocity ?? velocity) / 2; // 1tick前の速度との平均を出す

  player.lastDimensionId ??= player.dimension.id;
  if (
    avgVelocity < config.speedA.maxVelocity ||
    Util.isOP(player) ||
    Date.now() - player.joinedAt < 5000 ||
    Date.now() - player.threwTridentAt < 5000 ||
    Date.now() - player.pistonPushedAt < 2000 ||
    player.isGliding || (Date.now() - player.stopGlideAt < 3000) ||
    !player.isMoved ||
    player.lastDimensionId !== player.dimension.id ||
    !player.isOnGround ||
    player.getEffect('speed') ||
    player.hasComponent(EntityRidingComponent.componentId) ||
    excluded.includes(Util.getGamemode(player)) ||
    (config.speedA.excludeTag && player.hasTag(config.speedA.excludeTag))
  ) return;
      
  player.speedACount ??= 0;
  player.speedACount++;
  if (config.speedA.flagCount === -1 || player.speedACount <= config.speedA.flagCount) {
    player.flagQueue = `Speed/A >> §c${player.name}§r §7[${player.speedACount}] (v: ${avgVelocity.toFixed(3)})§r§　`;
  }
  // rollback
  const loc = player.lastLocation ?? player.location;
  const dimension = world.getDimension(player.lastDimensionId);
  if (config.speedA.rollback) player.teleport(loc, { dimension, rotation: player.getRotation() });
  // flag
  if (config.speedA.flagCount !== -1 && player.speedACount > config.speedA.flagCount) {
    Util.flag(player, 'Speed/A', config.speedA.punishment, `速すぎる移動を検知しました §7(count: ${player.speedACount}, v: ${avgVelocity.toFixed(3)})§r`);
  }
  
  player.lastVelocity = velocity; // 平均のせいで2回連続で検知されるのを防ぐ
}

/** @arg {import('@minecraft/server').Player} player */
export function checkMoving(player) {
  if (!player.lastLocation) {
    player.isMoved = true;
    return;
  }
  // ディメンション変えた直後速度がバグるから遅延かける
  if ( 
    Date.now() - player.dimensionSwitchedAt > 4000 &&
    !vectorEquals(player.lastLocation, player.location)
  ) {
    player.isMoved = true;
  }
}

function vectorEquals(vec1, vec2) {
  return vec1.x === vec2.x && vec1.y === vec2.y && vec1.z === vec2.z;
}