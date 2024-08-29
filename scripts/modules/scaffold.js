import { world, PlayerPlaceBlockAfterEvent, Player } from '@minecraft/server';
import config from '../config.js';
import { Vec3 } from '../util/bedrock-boost/Vec3';
import { Util } from '../util/util';

/** @typedef {import('@minecraft/server').Vector3} Vector3 */

/**
 * @typedef PlayerData
 * @property {number} speed
 * @property {import('@minecraft/server').Vector2} rot
 * @property {number} dDiff
 * @property {number} mDiff
 * @property {number} bps
 */

/** @type {Map<string, number[]>} */
const placeLog = new Map();
/** @type {Record<string, { at?: number, location?: Vector3, lastLocation?: Vector3 }>} */
const lastDataCache = {}
/** @type {Record<string, number>} */
const potentialScaffold = {};
/** @type {Set<string>} */
const types = new Set();

/** @param {PlayerPlaceBlockAfterEvent} ev */
export function onPlaceBlock(ev) {
  const { player } = ev;

  if (Util.isOP(player)) return;

  lastDataCache[player.id] ??= {};
  potentialScaffold[player.id] ??= 0;
  if (!placeLog.has(player.id)) placeLog.set(player.id, []);
  const placeData = placeLog.get(player.id);
  const now = Date.now();

  const bps = placeData?.filter(t => now - t < 1000).length ?? 0;
  placeData?.push(now);

  const data = /** @type {PlayerData} */ ({});
  scaffold(ev, bps, data);
  const { speed, rot, dDiff, mDiff } = data;

  if (!(potentialScaffold[player.id] > 4)) return;

  player.scaffoldCount ??= 0;
  player.scaffoldCount++;

  if (config.scaffold.flagCount === -1 || player.scaffoldCount <= config.scaffold.flagCount) {
    player.flagQueue = `Scaffold/${[...types].join('/')} >> §c${player.name}§r §7[${player.scaffoldCount}] (bps: ${bps}, xRot: ${rot.x.toFixed(1)})§r§　`;
  }

  if (config.scaffold.flagCount !== -1 && player.scaffoldCount > config.scaffold.flagCount) {
    const msg = `Scaffold/${[...types].join('/')}を検知しました (bps=${bps}, speed=${speed.toFixed(2)}, xRot=${rot.x.toFixed(2)}, dDiff=${dDiff.toFixed(1)}, mDiff=${mDiff.toFixed(1)})`
    Util.flag(player, 'Scaffold', config.scaffold.punishment, msg);
  }

  potentialScaffold[player.id] = 0;
  types.clear();
  ev.block.setType('minecraft:air');
  player.teleport(player.lastLocation ?? player.location);
}

/**
 * @param {PlayerPlaceBlockAfterEvent} ev
 * @param {number} bps
 * @param {PlayerData} data
 */
function scaffold(ev, bps, data) {
  const { player, block } = ev;
  const cancel = () => {
    block.setType('minecraft:air');
    player.teleport(player.lastLocation ?? player.location);
  }
  if (bps < config.scaffold.bps) return;

  const range = block.dimension.heightRange;
  const below = range.min !== block.y && block.below();
  if (below && !(below.isAir || below.isLiquid)) return;

  const loc = Vec3.from(player.location);
  const vel = player.getVelocity();
  const speed = Math.hypot(vel.x, vel.y, vel.z);
  const isMoving = speed > config.scaffold.minSpeed;

  const dir = player.getViewDirection();
  const tan = dir.z / dir.x;
  const dDegrees = Math.atan(tan) * (180 / Math.PI);
  const dDiff = Math.abs(Math.abs(dDegrees) - 45);
  // difference from 45 degrees direction
  const isDiagonalView = dDiff < config.scaffold.dDiff;

  const lastData = lastDataCache[player.id];
  if (!lastData || !lastData.lastLocation) return;
  if (loc.equals(lastData.lastLocation)) return;
  const mov = loc.subtract(lastData.lastLocation).normalize();
  const mTan = mov.z / mov.x;
  const mDegrees = Math.atan(mTan) * (180 / Math.PI);
  const mDiff = Math.abs(Math.abs(mDegrees) - 45);
  
  const rot = player.getRotation();
  const isOnGround = player.isOnGround;
  const isSprinting = player.isSprinting;

  Object.assign(data, { speed, rot, dDiff, mDiff, bps });

  // Scaffold/A: detects if the player is placing blocks while facing diagonally
  if (config.scaffold.A && bps >= 12 && isMoving && isDiagonalView && isOnGround) {
    types.add('A');
    potentialScaffold[player.id]++;
    // console.warn(`${player.name} A (bps=${bps}, v=${speed.toFixed(2)}, mDiff=${mDiff.toFixed(1)}, dDiff=${dDiff.toFixed(1)})`);
    return;
  }

  // Scaffold/B: detects if the player is placing blocks under the block standing on
  if (config.scaffold.B) scaffoldB(block, player);

  // Scaffold/C: detects if the player is placing blocks while moving and facing diagonally
  if (config.scaffold.C && bps >= 12 && isMoving && (isDiagonalView && mDiff < 10)) {
    types.add('C');
    potentialScaffold[player.id]++;
    // console.warn(`${player.name} C (bps=${bps}, mDiff=${mDiff.toFixed(1)}, dDiff=${dDiff.toFixed(1)})`);
    return;
  }

  // Scaffold/D: detects if the player is placing blocks while sprinting or jumping
  if (config.scaffold.D && bps >= 9 && rot.x % 1 === 0 && (isSprinting || player.isJumping)) {
    types.add('D');
    potentialScaffold[player.id]++;
    // console.warn(`${player.name} D (bps=${bps}, xRot=${rot.x}, sprint=${isSprinting}, jump=${player.isJumping})`);
    if (potentialScaffold[player.id] > 1 || isSprinting) cancel();
    return;
  }

  // Scaffold/E: detects if the player is placing blocks while moving diagonally
  if (config.scaffold.E && bps >= 11 && isMoving && mDiff < 15 && isOnGround) {
    types.add('E');
    potentialScaffold[player.id]++;
    // console.warn(`${player.name} E (bps=${bps}, mDiff=${mDiff.toFixed(1)}, v=${speed.toFixed(2)})`);
    return;
  }

  // Scaffold/F: detects if the player is placing blocks under the foot while looking up
  if (config.scaffold.F && bps >= 6 && rot.x < -15 && block.location.y < player.location.y) {
    types.add('F');
    potentialScaffold[player.id]++;
    if (rot.x < -80) potentialScaffold[player.id]++;
    // console.warn(`${player.name} F (bps=${bps}, xRot=${rot.x})`);
    return;
  }

  // Scaffold/H detects horion's bypass option
  if (config.scaffold.H && bps >= 5 && ((Number.isInteger(rot.x) && rot.x !== 0) || (Number.isInteger(rot.y) && rot.y !== 0))) {
    types.add('H');
    potentialScaffold[player.id]++;
    // console.warn(`${player.name} H (xRot=${rot.x}, yRot=${rot.y})`);
    return;
  }
}

/**
 * @param {import('@minecraft/server').Block} block
 * @param {Player} player
 */
function scaffoldB(block, player) {
  const yDiff = block.location.y - player.location.y + 1;
  if (yDiff !== -1) return;
  const above = block.dimension.heightRange.max !== block.y && block.above();
  if (above && above.isAir) return;
  const below = block.below();
  const surroundings = [below.below(), below.north(), below.south(), below.east(), below.west()];
  if (surroundings.every(b => b && (b.isAir || b.isLiquid))) {
    types.add('B');
    potentialScaffold[player.id]++;
    if (potentialScaffold[player.id] > 2 || player.isSprinting) block.setType('minecraft:air');
    return;
  }
}

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  placeLog.delete(playerId);
  delete lastDataCache[playerId];
  delete potentialScaffold[playerId];
});

/** @param {Player} player */
export function updatePlayerData(player) {
  if (!placeLog.has(player.id)) placeLog.set(player.id, []);
  const log = placeLog.get(player.id);
  const now = Date.now();
  while (log.length) {
    if (now - log[0] < 1000) break;
    log.shift();
  }
  const data = lastDataCache[player.id] ?? {};

  // player.onScreenDisplay.setActionBar([
  //   `location: ${fLoc(player.location)}`,
  //   `lastLocation: ${fLoc(data.location ?? player.location)}`,
  //   `bps: ${log.length}`,
  //   `potential: ${potentialScaffold[player.id]}`,
  //   `xRot: ${player.getRotation().x}`,
  // ].join('\n'));

  Object.assign(data, {
    at: now,
    location: player.location,
    lastLocation: data.location
  });
  lastDataCache[player.id] = data;
}

// function fLoc(loc) {
//   return `${loc.x.toFixed(2)} ${loc.y.toFixed(2)} ${loc.z.toFixed(2)}`;
// }