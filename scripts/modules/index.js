import { world, system, Player } from '@minecraft/server';
import { Util } from '../util/util';
import { PermissionType, Permissions } from '../util/Permissions';
import config from '../config.js';
import { PropertyIds } from '../util/constants';
import { AdminPanel } from '../form/AdminPanel';
import { getCPS } from './combat';
import { BanManager } from '../util/BanManager';
import { getTPS } from '../util/tps';

export * from './item_check';
export * from './spammer';
export * from './place_check';
export * from './entity_check';
export * from './combat';
export * from './break_check';
export * from './movement';

/**
 * @param {Player} player
 * @returns {boolean} banしたかどうか
 */
export function banCheck(player) {
  const unbanQueue = BanManager.getUnbanQueue();
  
  if (BanManager.isBanned(player)) { // ban by DP, tag, name, id
    const expireAt = player.getDynamicProperty(PropertyIds.banExpireAt);
    const isInQueue = unbanQueue.some(entry => entry.name === player.name);
    if (
      isInQueue ||
      expireAt && expireAt - Date.now() < 0
    ) {
      BanManager.unban(player);
      Util.notify(`§o§7Unbanned${isInQueue ? '' : '(expired)'}: ${player.name}`);
      return;
    }
    
    const reason = player.getDynamicProperty(PropertyIds.banReason);
    const message = [
      `§7Reason:§r ${reason ?? 'banned'}`,
      expireAt ? `§7ExpireAt: §f${Util.getTime(expireAt, true)}` : null
    ].filter(Boolean).join('\n');

    Util.notify(`§l§c${player.name}§r >> 接続を拒否しました\n${message}`);
    Util.writeLog({
      type: 'disconnect.ban',
      message: `接続を拒否しました\n${message}`
    }, player);
    return Util.kick(player, message, true);
  }
}

export function xuidBanCheck() {
  const overworld = world.getDimension('overworld');
  for (const xuid of config.permission.ban.xuids) { // ban by xuid
    const res = Util.runCommandSafe(`kick "${xuid}" §lKicked by TN-AntiCheat§r\nReason: §aBanned by XUID`, overworld);
    if (res) {
      Util.notify(`BANリストに含まれる XUID: §c${xuid}§r のプレイヤーをキックしました`);
      Util.writeLog({ type: 'disconnect.xuid', playerName: '(banned player)', message: `BANリストに含まれる XUID: §c${xuid}§r のプレイヤーをキックしました` });
    }
  }
}

/** @param {Player} player */
export function flag(player) { // don't run every tick not to spam
  if (player.flagQueue) {
    Util.notify(player.flagQueue);
    player.flagQueue = null;
  }
}

export function notify() {
  if (Object.keys(world.entityCheck).length > 0) {
    const entityCheck = Object.values(world.entityCheck);
    let msg = entityCheck
      .slice(0, 3)
      .map(e => `- §c${e.item ? `${e.item}§f (item)` : e.typeId}§r §7[${e.x}, ${e.y}, ${e.z}] ${e.count > 1 ? `§6x${e.count}` : ''}§r`)
      .join('\n');
    if (entityCheck.length > 3) msg += `\n§7more ${entityCheck.length - 3} entities...`;
    Util.notify(`禁止エンティティをkillしました\n${msg}`);
    world.entityCheck = {};
  }
}

/** @param {Player} player */
export function namespoof(player) {
  if (!config.namespoof.state) return;
  if (player.name.length > config.namespoof.maxLength) // 長い名前対策
    Util.flag(player, 'Namespoof', config.namespoof.punishment, `長すぎる名前を検知しました`);
}

/** @param {Player} player */
export function creative(player) {
  if (!config.creative.state || Util.isOP(player) || Permissions.has(player, PermissionType.Builder)) return;
  if (Util.isCreative(player)) {
    player.runCommand(`gamemode ${config.creative.defaultGamemode} @s`);
    Util.flag(player, 'Creative', config.creative.punishment, 'クリエイティブは許可されていません');
  }
}

/** @param {import('@minecraft/server').ItemUseOnBeforeEvent} ev */
export function getBlock(ev) {
  const { source, itemStack: item, block } = ev;
  
  if (
    !config.others.blockCopy ||
    !Util.isCreative(source) ||
    !AdminPanel.isPanelItem(item)
  ) return;
  
  system.run(() => {
    if (!source.isSneaking) return;
    const blockItem = block.getItemStack(1, true);
    source.getComponent('minecraft:inventory').container.addItem(blockItem);
  });
}

/** @param {Player} p */
export function debugView(p) {
  if (!p.hasTag('ac:debug')) return;
  const loc = p.location;
  const rot = p.getRotation();
  const vel = p.getVelocity();
  const mainHand = p.getComponent('minecraft:inventory').container.getItem(p.selectedSlotIndex)?.typeId;
  const cps = getCPS(p);
  
  p.onScreenDisplay.setActionBar([
    `[${p.name}] tps: ${getTPS().toFixed(1)}, op: ${fmt(Util.isOP(p))}, op(mc): ${fmt(p.isOp())}`,
`slot: ${fmt(p.selectedSlotIndex)}, hand: ${fmt(mainHand)}`,
    `sneaking: ${fmt(p.isSneaking)}, onGround: ${fmt(p.isOnGround)}, flying: ${fmt(p.isFlying)}, fallDistance: ${fmt(p.fallDistance.toFixed(2))}, cps: ${fmt(cps?.toFixed(1))}`,
    `location: [${loc.x.toFixed(4)}, ${loc.y.toFixed(4)}, ${loc.z.toFixed(4)}]`,
    `rotation: [${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}], velocity: [${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}, ${vel.z.toFixed(2)}]`
  ].join('\n'));
}

function fmt(value) {
  if (typeof value === 'boolean') return value ? `§a${value}§r` : `§c${value}§r`;
  if (value === undefined || value === null) return `§7${value}§r`;
  return value;
}