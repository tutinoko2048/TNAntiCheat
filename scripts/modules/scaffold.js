import { world, PlayerPlaceBlockAfterEvent, Player } from '@minecraft/server';
import { Vec3 } from '../util/bedrock-boost/Vec3';
import { Util } from '../util/util';

/** @typedef {import('@minecraft/server').Vector3} Vector3 */

/** @type {Map<string, number[]>} */
const placeLog = new Map();
/** @type {Record<string, { at?: number, location?: Vector3, lastLocation?: Vector3 }>} */
const lastData = {}
/** @type {Record<string, number>} */
const potentialScaffold = {};
/** @type {Set<string>} */
const types = new Set();

const config = {
  A: true,
  B: false,
  C: true,
  D: true,
  E: true,
  F: true,
  H: true,
  log: false,
  bps: 4,
  yDiff: 0.3,
  dDiff: 10,
  v: 0.18
}

/** @param {PlayerPlaceBlockAfterEvent} ev */
export function onPlaceBlock(ev) {
  const playerId = ev.player.id;
  lastData[playerId] ??= {};
  potentialScaffold[playerId] ??= 0;
  if (!placeLog.has(playerId)) placeLog.set(ev.player.id, []);
  const data = placeLog.get(playerId);
  const now = Date.now();

  const bps = data?.filter(t => now - t < 1000).length ?? 0;
  data?.push(now);

  scaffold(ev, bps);
}

/** @param {PlayerPlaceBlockAfterEvent} ev */
function scaffold(ev, bps) {
  const { player, block } = ev;
  const cancel = () => block.setType('minecraft:air');
  if (bps < config.bps) return;

  const yDiff = Math.abs(player.location.y - block.location.y - 1);
  if (!(yDiff < config.yDiff)) return;

  const range = block.dimension.heightRange;
  const below = range.min !== block.y && block.below();
  if (below && !(below.isAir || below.isLiquid)) return;

  const loc = Vec3.from(player.location);
  const vel = player.getVelocity();
  const v = Math.hypot(vel.x, vel.y, vel.z);
  const isMoving = v > config.v;

  const dir = player.getViewDirection();
  const tan = dir.z / dir.x;
  const dDegrees = Math.atan(tan) * (180 / Math.PI);
  const dDiff = Math.abs(Math.abs(dDegrees) - 45);
  const isDiagonalView = dDiff < config.dDiff;

  const data = lastData[player.id];
  if (!data || !data.lastLocation) return;
  const mov = loc.subtract(data.lastLocation).normalize();
  const mTan = mov.z / mov.x;
  const mDegrees = Math.atan(mTan) * (180 / Math.PI);
  const mDiff = Math.abs(Math.abs(mDegrees) - 45);

  const rot = player.getRotation();
  const isOnGround = player.isOnGround;
  const isSprinting = player.isSprinting;

  // Scaffold/A: detects if the player is placing blocks while facing diagonally
  if (config.A && bps >= 12 && isMoving && isDiagonalView && isOnGround) {
    types.add('A');
    potentialScaffold[player.id]++;
    console.warn(`${player.name} A (bps=${bps}, v=${v.toFixed(2)}, mDiff=${mDiff.toFixed(1)}, dDiff=${dDiff.toFixed(1)})`);
    return;
  }

  // Scaffold/B: detects if the player is placing blocks under the block standing on
  if (config.B) {
    const yDiff = block.location.y - player.location.y + 1;
    if (yDiff !== -1) return;
    const above = range.max !== block.y && block.above();
    if (above && above.isAir) return;
    const surroundings = [below.below(), below.north(), below.south(), below.east(), below.west()];
    if (surroundings.every(b => b && (b.isAir || b.isLiquid))) {
      types.add('B');
      potentialScaffold[player.id]++;
      console.warn(`${player.name} B (bps=${bps}, yDiff=${yDiff})`);
      if (potentialScaffold[player.id] > 2 || isSprinting) cancel();
      return;
    }
  }

  // Scaffold/C: detects if the player is placing blocks while moving and facing diagonally
  if (config.C && bps >= 12 && isMoving && (dDiff < 10 && mDiff < 10)) {
    types.add('C');
    potentialScaffold[player.id]++;
    console.warn(`${player.name} C (bps=${bps}, mDiff=${mDiff.toFixed(1)}, dDiff=${dDiff.toFixed(1)})`);
    return;
  }
  // Scaffold/D: detects if the player is placing blocks while sprinting or jumping
  if (config.D && bps >= 9 && rot.x % 1 === 0 && (isSprinting || player.isJumping)) {
    types.add('D');
    potentialScaffold[player.id]++;
    console.warn(`${player.name} D (bps=${bps}, xRot=${rot.x}, sprint=${isSprinting}, jump=${player.isJumping})`);
    if (potentialScaffold[player.id] > 1 || isSprinting) cancel();
    return;
  }
  // Scaffold/E: detects if the player is placing blocks while moving diagonally
  if (config.E && bps >= 11 && isMoving && mDiff < 15 && isOnGround) {
    types.add('E');
    potentialScaffold[player.id]++;
    console.warn(`${player.name} E (bps=${bps}, mDiff=${mDiff.toFixed(1)}, v=${v.toFixed(2)})`);
    return;
  }
  // Scaffold/F: detects if the player is placing blocks under the foot while looking up
  if (config.F && bps >= 7 && rot.x < -30 && block.location.y < player.location.y) {
    types.add('F');
    potentialScaffold[player.id]++;
    if (rot.x < -80) potentialScaffold[player.id]++;
    console.warn(`${player.name} F (bps=${bps}, xRot=${rot.x})`);
    return;
  }

  // Scaffold/H detects horion's bypass option
  if (config.H && bps >= 5 && ((Number.isInteger(rot.x) && rot.x !== 0) || (Number.isInteger(rot.y) && rot.y !== 0))) {
    types.add('H');
    potentialScaffold[player.id]++;
    console.warn(`${player.name} H (xRot=${rot.x}, yRot=${rot.y})`);
    return;
  }

  if (potentialScaffold[player.id] > 4) {
    const msg = `Scaffold/${[...types].join('/')}を検知しました (bps=${bps}, v=${v.toFixed(2)}, xRot=${rot.x.toFixed(2)}, yDiff=${yDiff.toFixed(1)}, dDiff=${dDiff.toFixed(1)}, mDiff=${mDiff.toFixed(1)})`
    world.sendMessage(msg);
    Util.flag(player, 'Scaffold', 'none', msg);
    potentialScaffold[player.id] = 0;
    types.clear();
    cancel();
  }
}

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
  placeLog.delete(playerId);
  delete lastData[playerId];
  delete potentialScaffold[playerId];
});

/** @param {Player} player */
export function updatePlayerData(player) {
    if (!placeLog.has(player.id)) placeLog.set(player.id, []);
    const log = /** @type {number[]} */ (placeLog.get(player.id));
    const now = Date.now();
    while (log.length) {
      if (now - log[0] < 1000) break;
      log.shift();
    }
    const data = lastData[player.id] ?? {};

    player.onScreenDisplay.setActionBar([
      `location: ${fLoc(player.location)}`,
      `lastLocation: ${fLoc(data.location ?? player.location)}`,
      `bps: ${log.length}`,
      `potential: ${potentialScaffold[player.id]}`,
      `xRot: ${player.getRotation().x.toFixed(2)}`,
    ].join('\n'));

    Object.assign(data, {
      at: now,
      location: player.location,
      lastLocation: data.location
    });
    lastData[player.id] = data;
  }

function fLoc(loc) {
  return `${loc.x.toFixed(2)} ${loc.y.toFixed(2)} ${loc.z.toFixed(2)}`;
}