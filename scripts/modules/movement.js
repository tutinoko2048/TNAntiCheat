import { world, Location, MinecraftEffectTypes, GameMode } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

const excluded = [ GameMode.creative, GameMode.spectator ];

export function speedA(player) {
  if (!config.speedA.state) return;
  
  player.lastLocation = player.location;
  player.lastDimension = player.dimension;
  
  const { x, y, z } = player.velocity;
  const velocity = Math.sqrt(x ** 2 + z ** 2); // velocity without Y
  // for debugging
  //if (player.isOp) player.onScreenDisplay.setActionBar(`vx: ${x.toFixed(3)}, vy: ${y.toFixed(3)}, vz: ${z.toFixed(3)}, velocity: §6${velocity.toFixed(3)}§r\nriding: ${color(player.hasTag('ac:is_riding'))}, gliding: ${color(player.hasTag('ac:is_gliding'))}, on_ground: ${color(player.hasTag('ac:on_ground'))}`);
  
  if (
    Util.isOP(player) ||
    excluded.includes(Util.getGamemode(player)) ||
    player.getEffect(MinecraftEffectTypes.speed) ||
    !player.hasTag('ac:on_ground') ||
    player.hasTag('ac:is_riding') ||
    player.hasTag('ac:is_gliding') ||
    player.lastDimension?.id != player.dimension.id
  ) return;
  
  player.speedACount ??= 0;
  let isFlagged = false;
  const avg = (velocity + player.lastVelocity ?? velocity) / 2; // 1tick前の速度との平均を出す
  if (avg > config.speedA.maxVelocity) {
    player.speedACount++
    isFlagged = true;

    player.speedAFlag = `Speed/A >> §c${player.name}§r (v: ${avg.toFixed(3)}, count: ${player.speedACount ?? 1})`;
    const loc = player.lastLocation ?? player.location;
    if (config.speedA.rollback) player.teleport(new Location(loc.x, loc.y, loc.z), player.lastDimension, player.rotation.x, player.rotation.y);
    
    if (config.speedA.flagCount !== -1 && player.speedACount > config.speedA.flagCount) {
      Util.flag(player, 'Speed/A', config.speedA.punishment, `速すぎる移動を検知しました (v: ${avg.toFixed(3)}, count: ${player.speedACount})`);
    }
  }
  
  player.lastVelocity = isFlagged ? null : velocity; // 平均のせいで2回連続で検知されるのを防ぐ
}

function color(bool) {
  return bool ? `§a${bool}§r` : `§c${bool}§r`;
}