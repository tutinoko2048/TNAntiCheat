import { world, system, MinecraftEffectTypes, GameMode } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

const excluded = [ GameMode.creative, GameMode.spectator ];

export function speedA(player) {
  if (!config.speedA.state) return;
  const { x, y, z } = player.getVelocity();
  const velocity = Math.sqrt(x ** 2 + z ** 2); // velocity without Y
  // for debugging
  if (player.isOp) player.onScreenDisplay.setActionBar(`vx: ${x.toFixed(3)}, vy: ${y.toFixed(3)}, vz: ${z.toFixed(3)}, velocity: §6${velocity.toFixed(3)}§r\nisMoved: ${color(player.isMoved)}, gliding: ${color(player.hasTag('ac:is_gliding'))}, on_ground: ${color(player.hasTag('ac:on_ground'))}`);
  
  player.lastDimensionId ??= player.dimension.id;
  if (
    Util.isOP(player) ||
    player.getEffect(MinecraftEffectTypes.speed) ||
    !player.hasTag('ac:on_ground') ||
    player.hasTag('ac:is_riding') ||
    player.hasTag('ac:is_gliding') ||
    excluded.includes(Util.getGamemode(player)) ||
    player.lastDimensionId != player.dimension.id ||
    Date.now() - player.joinedAt < 5000 ||
    !player.isMoved
  ) return;
  
  player.speedACount ??= 0;
  let isFlagged = false;
  const avg = (velocity + player.lastVelocity ?? velocity) / 2; // 1tick前の速度との平均を出す
  if (avg > config.speedA.maxVelocity) {
    player.speedACount++
    isFlagged = true;

    player.speedAFlag = `Speed/A >> §c${player.name}§r §7(count: ${player.speedACount ?? 1}, v: ${avg.toFixed(3)})§r`;
    const loc = player.lastLocation ?? player.location;
    const dimension = world.getDimension(player.lastDimensionId);
    if (config.speedA.rollback) player.teleport(loc, dimension, player.getRotation().x, player.getRotation().y);
    
    if (config.speedA.flagCount !== -1 && player.speedACount > config.speedA.flagCount) {
      Util.flag(player, 'Speed/A', config.speedA.punishment, `速すぎる移動を検知しました §7(count: ${player.speedACount}, v: ${avg.toFixed(3)})§r`);
    }
  }
  
  player.lastVelocity = isFlagged ? null : velocity; // 平均のせいで2回連続で検知されるのを防ぐ
}

function color(bool) {
  return bool ? `§a${bool}§r` : `§c${bool}§r`;
}

export function checkMoving(player) {
  if (!player.lastLocation) {
    player.isMoved = true;
    return;
  }
  if (
    Date.now() - player.dimensionSwitchedAt > 4*1000 &&
    !vectorEquals(player.lastLocation, player.location)
  ) {
    player.isMoved = true;
  }
}

function vectorEquals(vec1, vec2) {
  return vec1.x === vec2.x && vec1.y === vec2.y && vec1.z === vec2.z;
}