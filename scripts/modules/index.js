import { world, system, Player } from '@minecraft/server';
import { Util } from '../util/util';
import { PermissionType, Permissions } from '../util/Permissions';
import config from '../config.js';
import  { PropertyIds } from '../util/constants';
import { AdminPanel } from '../form/AdminPanel';
import { getCPS } from './combat';

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
export function ban(player) {
  const unbanQueue = Util.getUnbanQueue();
  
  if (Util.isBanned(player)) { // ban by DP, tag, name, id
    if (unbanQueue.some(entry => entry.name === player.name)) {
      Util.unban(player);
      Util.notify(`§aUnbanned: ${player.name}`);
      return;
    }
    
    const reason = player.getDynamicProperty(PropertyIds.banReason);
    Util.notify(`§l§c${player.name}§r >> 接続を拒否しました\n§7Reason:§r ${reason ?? 'banned'}`);
    Util.writeLog({ type: 'disconnect.ban', message: `接続を拒否しました\n§7Reason:§r ${reason ?? 'banned'}` }, player);
    return Util.kick(player, reason ?? '-', true);
  }
}

export function banByXuid() {
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
  if (player.reachAFlag) {
    Util.flag(player, 'Reach/A', config.reachA.punishment, player.reachAFlag);
    player.reachAFlag = null;
  }
  if (player.reachBFlag) {
    Util.flag(player, 'Reach/B', config.reachB.punishment, player.reachBFlag);
    player.reachBFlag = null;
  }
  if (player.reachCFlag) {
    Util.flag(player, 'Reach/C', config.reachC.punishment, player.reachCFlag);
    player.reachCFlag = null;
  }
  if (player.autoClickerFlag) {
    Util.flag(player, 'AutoClicker', config.autoClicker.punishment, player.autoClickerFlag);
    player.autoClickerFlag = null;
  }
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
    !(source instanceof Player) ||
    !Util.isCreative(source) ||
    !AdminPanel.isPanelItem(item)
  ) return;
  
  system.run(() => {
    if (!source.isSneaking) return;
    const blockItem = block.getItemStack(1, true);
    source.getComponent('minecraft:inventory').container.addItem(blockItem);
  });
}

/** @arg {Player} p @arg {import('../ac').TNAntiCheat} ac */
export function debugView(p, ac) {
  if (!p.hasTag('ac:debug')) return;
  const loc = p.location;
  const rot = p.getRotation();
  const vel = p.getVelocity();
  const mainHand = p.getComponent('minecraft:inventory').container.getItem(p.selectedSlot)?.typeId;
  const cps = getCPS(p);
  
  p.onScreenDisplay.setActionBar([
    `[${p.name}] tps: ${ac.getTPS().toFixed(1)}, op: ${format(Util.isOP(p))}, op(mc): ${format(p.isOp())}`,
`slot: ${format(p.selectedSlot)}, hand: ${format(mainHand)}`,
    `sneaking: ${format(p.isSneaking)}, onGround: ${format(p.isOnGround)}, flying: ${format(p.isFlying)}, fallDistance: ${format(p.fallDistance.toFixed(2))}, cps: ${format(cps?.toFixed(1))}`,
    `location: [${loc.x.toFixed(4)}, ${loc.y.toFixed(4)}, ${loc.z.toFixed(4)}]`,
    `rotation: [${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}], velocity: [${vel.x.toFixed(2)}, ${vel.y.toFixed(2)}, ${vel.z.toFixed(2)}]`
  ].join('\n'));
}

function format(value) {
  if (typeof value === 'boolean') return value ? `§a${value}§r` : `§c${value}§r`;
  if (value === undefined || value === null) return `§7${value}§r`;
  return value;
}