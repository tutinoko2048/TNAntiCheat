import { GameMode, EntityRidingComponent, Player } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';
import { createPlayerCache } from '../util/PlayerCache';

const excluded = [GameMode.creative, GameMode.spectator];

const cacheLength = 5;

/** @type {Map<string, number[]>} */
const velocityCache = createPlayerCache(() => []);

/** @type {Map<string, { dimension?: import('@minecraft/server').Dimension, location?: import('@minecraft/server').Vector3 }>} */
const lastDataCache = createPlayerCache(() => ({}));

/** @arg {Player} player */
export function speedA(player) {
  if (!config.speedA.state) return;

  const { x, z } = player.getVelocity();
  const velocity = Math.sqrt(x ** 2 + z ** 2); // velocity without Y

  const lastData = lastDataCache.get(player.id);
  const { dimension: lastDimension, location: lastLocation } = lastData;

  if (
    Util.isOP(player) ||
    Date.now() - player.joinedAt < 5000 ||
    Date.now() - player.threwTridentAt < 5000 ||
    Date.now() - player.pistonPushedAt < 2000 ||
    player.isGliding || (Date.now() - player.stopGlideAt < 3000) ||
    !player.isMoved ||
    (lastDimension && (lastDimension !== player.dimension)) ||
    !player.isOnGround ||
    player.getEffect('speed') ||
    player.hasComponent(EntityRidingComponent.componentId) ||
    excluded.includes(player.getGameMode()) ||
    (config.speedA.excludeTag && player.hasTag(config.speedA.excludeTag))
  ) return;

  lastData.dimension = player.dimension;
  lastData.location = Util.floorVector(player.location);

  const velocities = velocityCache.get(player.id);
  if (velocities.length >= cacheLength) velocities.shift();
  velocities.push(velocity);
  const avgVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length;

  if (
    velocities.length < cacheLength ||
    avgVelocity < config.speedA.maxVelocity
  ) return;
      
  player.speedACount ??= 0;
  player.speedACount++;
  if (config.speedA.flagCount === -1 || player.speedACount <= config.speedA.flagCount) {
    player.flagQueue = `Speed/A >> §c${player.name}§r §7[${player.speedACount}] (v: ${avgVelocity.toFixed(3)})§r§　`;
  }

  if (config.speedA.rollback) {
    player.teleport(lastLocation ?? player.location, { dimension: lastDimension });
  }

  if (config.speedA.flagCount !== -1 && player.speedACount > config.speedA.flagCount) {
    Util.flag(player, 'Speed/A', config.speedA.punishment, `速すぎる移動を検知しました §7(count: ${player.speedACount}, v: ${avgVelocity.toFixed(3)})§r`);
  }
  
  velocities.length = 0;
}

/** @arg {Player} player */
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