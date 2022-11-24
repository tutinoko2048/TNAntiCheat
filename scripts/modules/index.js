import { world, Location, ItemStack, MinecraftBlockTypes, MinecraftItemTypes, MinecraftEnchantmentTypes, EntityHitEvent, BeforeItemUseOnEvent, BlockBreakEvent } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';
import chatFilterData from '../chatFilter.js';
import toJson from '../lib/toJson';

// MinecraftItemTypes.air returns undefined so we create item which amount is zero
const ITEM_AIR = new ItemStack(MinecraftItemTypes.stick, 0, 0);
const BLOCK_AIR = MinecraftBlockTypes.air.createDefaultBlockPermutation();

export function flag(player) { // don't run every tick not to spam
  if (player.attackReachFlag) {
    Util.flag(player, 'AttackReach', config.reach.punishment, player.attackReachFlag);
    player.attackReachFlag = null;
  }
  if (player.blockReachFlag) {
    Util.flag(player, 'BlockReach', config.reach.punishment, player.blockReachFlag);
    player.blockReachFlag = null;
  }
  if (player.autoClickerFlag) {
    Util.flag(player, 'AutoClicker', config.autoClicker.punishment, player.autoClickerFlag);
    player.autoClickerFlag = null;
  }
}

export function notify() {
  if (Object.keys(world.entityCheck).length > 0) {
    const entityCheck = Object.values(world.entityCheck);
    let msg = entityCheck
      .slice(0, 3)
      .map(e => `§c${e.item ? `${e.item}§f (item)` : e.typeId}§r §7[${e.x}, ${e.y}, ${e.z}] ${e.count > 1 ? `§6x${e.count}` : ''}§r`)
      .join('\n');
    if (entityCheck.length > 3) msg += `\n§amore ${entityCheck.length - 3} entities...`;
    Util.notify(`禁止エンティティをkillしました\n${msg}`);
    world.entityCheck = {}
  }
}

function queueNotify(type, obj) {
  const key = Object.values(obj).join('-');
  if (key in world[type]) {
    world[type][key].count ??= 1;
    return world[type][key].count++
  }
  world[type][key] = obj;
}

export function crasher(player) {
  if (!config.crasher.state) return;
  const { x, y, z } = player.location;
  if (Math.abs(x) > 30000000 || Math.abs(y) > 30000000 || Math.abs(z) > 30000000) {
    player.teleport(new Location(0, 255, 0), player.dimension, 0, 0);
    if (Util.isOP(player)) return; // prevent crasher by all players but don't punish OP
    Util.flag(player, 'Crasher', config.crasher.punishment, 'Crasherの使用を検知しました');
  }
}

export function nuker(player) {
  if (!config.nuker.state) return;
  const { location, breakCount = 0 } = player;
  if (breakCount > config.nuker.limit) {
    const { x, y, z } = player.location;
    Util.flag(player, 'Nuker', config.nuker.punishment, `Nukerの使用を検知しました [${Math.round(x)}, ${Math.round(y)}, ${Math.round(z)}] (§c${breakCount}blocks/tick§r)`);
  }
}

export function namespoof(player) {
  if (!config.namespoof.state) return;
  if (player.name.length > config.namespoof.maxLength) // 長い名前対策
    Util.flag(player, 'Namespoof', config.namespoof.punishment, `長すぎる名前を検知しました`);
}

export function spammerA(ev) {
  const { message, sender } = ev;
  if (config.spammerA.state && message.length > config.spammerA.maxLength) {
    Util.notify(`チャットが長すぎます (${message.length}>${config.spammer.maxLength})`, sender);
    ev.cancel = true;
  }
}

export function spammerB(ev) {
  const { message, sender } = ev;
  if (config.spammerB.state && message === sender.lastMsg) {
    Util.notify('重複したチャットは送信できません', sender);
    return ev.cancel = true;
  }
  sender.lastMsg = message;
}

export function spammerC(ev) {
  const { message, sender } = ev;
  if (config.spammerC.state && sender.lastMsgSentAt && Date.now() - sender.lastMsgSentAt < config.spammerC.minInterval) {
    const wait = (Date.now() - sender.lastMsgSentAt) / 1000;
    Util.notify(`チャットの送信間隔が速すぎます。${wait.toFixed(1)}秒待ってください`, sender);
    return ev.cancel = true;
  } else sender.lastMsgSentAt = Date.now();
}

export function itemCheck(player) {
  const { container } = player.getComponent('minecraft:inventory');
  if (config.itemCheckD.state && config.itemCheckD.mode == 'hand') {
    let item = container.getItem(player.selectedSlot);
    if (item) {
      try {
      enchantCheck(item, container, player.selectedSlot, player);
      } catch(e) { console.warn(e, e.stack) }
    } 
  }
  
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    if (config.itemCheckA.state && isIllegalItem(item.typeId)) {
      container.setItem(i, ITEM_AIR);
      Util.flag(player, 'ItemCheck/A', getItemPunishment(item.typeId), `禁止アイテムの所持を検知しました (${itemMessageBuilder(item)})`, config.itemCheckA.notifyCreative);
      continue;
    }
    if (config.itemCheckB.state && isSpawnEgg(item.typeId)) {
      container.setItem(i, ITEM_AIR);
      Util.flag(player, 'ItemCheck/B', config.itemCheckB.punishment, `スポーンエッグの所持を検知しました (${itemMessageBuilder(item)})`);
      continue;
    }
    if (config.itemCheckC.state && item.amount > config.itemCheckC.maxAmount) {
      container.setItem(i, ITEM_AIR);
      Util.flag(player, 'ItemCheck/C', config.itemCheckC.punishment, `不正なアイテムの個数を検知しました (${itemMessageBuilder(item, 'amount')})`);
      continue;
    }
    if (config.itemCheckD.state && config.itemCheckD.mode == 'inventory')
      enchantCheck(item, container, i, player);
  }
}

const despawnable = ['minecraft:npc', 'minecraft:command_block_minecart'];
export function entityCheck(entity) {
  const { typeId, location } = entity;
  
  if (config.entityCheckC.state) {
  
    if (typeId == 'minecraft:arrow') {
      world.arrowSpawnCount++
      if (world.arrowSpawnCount > config.entityCheckC.maxArrowSpawns) return entity.kill();
      
    } else if (typeId == 'minecraft:item') {
      world.itemSpawnCount++
      if (world.itemSpawnCount > config.entityCheckC.maxItemSpawns) return entity.kill();
      
    } else if (typeId == 'minecraft:command_block_minecart') {
      world.cmdSpawnCount++
      if (world.cmdSpawnCount > config.entityCheckC.maxCmdMinecartSpawns) return entity.kill();
    }
  }
  
  if (config.entityCheckA.state && config.entityCheckA.detect.includes(typeId)) {
    const loc = Util.vectorNicely(location);
    entity.kill();
    if (config.entityCheckA.punishment != 'none') queueNotify('entityCheck', { typeId, ...loc });
    if (despawnable.includes(typeId)) try { entity.triggerEvent('tn:despawn') } catch {};
    
  } else if (config.entityCheckB.state && typeId === 'minecraft:item') {
    const item = entity.getComponent('minecraft:item')?.itemStack;
    if (isIllegalItem(item?.typeId) || (config.entityCheckB.spawnEgg && isSpawnEgg(item?.typeId))) {
      const loc = Util.vectorNicely(location);
      entity.kill();
      if (config.entityCheckB.punishment != 'none') queueNotify('entityCheck', { typeId, item: item.typeId, ...loc });
    }
    
  } else if (config.entityCheckD.state && config.entityCheckD.detect.includes(typeId)) {
    const container = entity.getComponent('minecraft:inventory')?.container;
    entityCheckD(container);
  }
}

function entityCheckD(container) {
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (
      isIllegalItem(item?.typeId) ||
      (config.entityCheckD.spawnEgg && isSpawnEgg(item?.typeId))
    ) container.setItem(i, ITEM_AIR);
  }
}

export function placeCheckA(ev) {
  if (!config.placeCheckA.state) return;
  const { source, item } = ev;
  if (source.typeId != 'minecraft:player') return;
  if (isIllegalItem(item?.typeId)) {
    ev.cancel = true;
    Util.flag(source, 'PlaceCheck/A', getItemPunishment(item.typeId), `禁止アイテムの使用を検知しました (${itemMessageBuilder(item)})`, config.placeCheckA.notifyCreative);
  }
  if (config.placeCheckA.antiShulker && isShulkerBox(item?.typeId)) {
    Util.notify(`§c${item.typeId}§f の使用は許可されていません`, source);
    ev.cancel = true;
  }
}

export function placeCheckB(ev) {
  const { block, player } = ev;
  if (!config.placeCheckB.state || !config.placeCheckB.detect.includes(block.typeId)) return;
  const container = block.getComponent('inventory')?.container;
  if (!container) return;
  const checkedItems = [];
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (isIllegalItem(item?.typeId) || (config.placeCheckB.spawnEgg && isSpawnEgg(item?.typeId))) {
      checkedItems.push(item);
      container.setItem(i, ITEM_AIR);
    }
  }
  if (checkedItems.length > 0) {
    let flagMsg = checkedItems.slice(0, 3).map(item => itemMessageBuilder(item)).join('\n');
    if (checkedItems.length > 3) flagMsg += `\n§amore ${checkedItems.length - 3} items...`;
    Util.flag(player, 'PlaceCheck/B', config.placeCheckB.punishment, `設置した ${block.typeId} に禁止アイテムが含まれています\n${flagMsg}`);
  }
}

/** @param {BlockPlaceEvent} ev */
export async function placeCheckC(ev) {
  const { block, player } = ev;
  if (!config.placeCheckC.state || !config.placeCheckC.detect.includes(block.typeId)) return;
  const permutation = block.permutation.clone();
  await player.runCommandAsync(`setblock ${block.x} ${block.y} ${block.z} ${block.typeId}`);
  block.setPermutation(permutation);
  if (config.others.debug) console.warn(`[DEBUG] PlaceCheckC: Reset: ${block.typeId}`);
}

export function reach(ev) {
  if (ev instanceof BeforeItemUseOnEvent) {
    const { source, blockLocation } = ev;
    if (source.typeId != 'minecraft:player' || Util.isCreative(source)) return;
    const distance = Util.distance(source.headLocation, blockLocation);
    if (distance > config.reach.blockReach) {
      source.blockReachFlag = `長いリーチを検知しました (length: ${distance.toFixed(2)}, event: ${ev.constructor.name})`;
      ev.cancel = true;
    }
      
  } else if (ev instanceof BlockBreakEvent) {
    const { player, block, brokenBlockPermutation } = ev;
    if (Util.isCreative(player)) return;
    const distance = Util.distance(player.headLocation, block.location);
    if (distance > config.reach.blockReach) {
      player.blockReachFlag = `長いリーチを検知しました (length: ${distance.toFixed(2)}, event: ${ev.constructor.name})`;
      block.setPermutation(brokenBlockPermutation);
    }
    
  } else if (ev instanceof EntityHitEvent) {
    const { entity, hitEntity } = ev;
    if (!hitEntity || entity.typeId != 'minecraft:player' || Util.isCreative(entity)) return;
    if (
      (config.reach.excludeCustomEntities && !hitEntity.typeId.startsWith('minecraft:')) ||
      config.reach.excludeEntities.includes(hitEntity.typeId)
    ) return;
    
    const distance = Util.distance(entity.headLocation, hitEntity.location);
    if (distance > config.reach.attackReach)
      entity.attackReachFlag = `長いリーチを検知しました (length: ${distance.toFixed(2)}, event: ${ev.constructor.name})`;
  }
}

export function autoClicker(ev) {
  const { entity, hitEntity } = ev;
  if (!hitEntity) return;
   entity.cps ??= [];
   
  if (entity.lastHitAt && Date.now() - entity.lastHitAt < 1000) {
    const cps = 1000 / (Date.now() - entity.lastHitAt);
    if (entity.cps.length > 4) entity.cps.shift();
    entity.cps.push(cps);
    const avg = Util.average(entity.cps);
    if (avg > config.autoClicker.maxCPS) entity.autoClickerFlag = `高いCPSを検知しました: §c${avg.toFixed(1)}clicks/s`;
  }
  entity.lastHitAt = Date.now();
}

/* normal tap users are also detected...?
export function autoTool(ev) {
  const { player } = ev;
  if (player.lastSelectedSlot !== player.selectedSlot) Util.flag(player, "AutoTool", 'notify', `slot: ${player.lastSelectedSlot} -> ${player.selectedSlot}`);
}
*/

export async function creative(player) {
  if (!Util.isCreative(player) || Util.isOP(player) || Util.hasPermission(player, 'builder')) return;
  await player.runCommandAsync(`gamemode ${config.creative.defaultGamemode} @s`);
  Util.flag(player, 'Creative', config.creative.punishment, 'クリエイティブは許可されていません');
}

function enchantCheck(item, container, slot, player) {
  const checked = [];
  const enchantment = item.getComponent('enchantments');
  const { enchantments } = enchantment;
  for (const enchant of enchantments) {
    const { level, type } = enchant;
    const { id, maxLevel } = type;
    if (level > maxLevel) {
      enchantments.removeEnchantment(type);
      checked.push({ level, id });
    }
  }
  if (checked.length > 0) {
    enchantment.enchantments = enchantments;
    container.setItem(slot, item);
    const msg = checked.map(e => `§7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 3
      ? msg.slice(0,3).join('\n') + `\n§7${msg.length - 3} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/D', config.itemCheckD.punishment, `オーバーエンチャントを検知しました (Item: §c${item.typeId}§f)\n${safeMessage}`);
  }
}

export function chatFilter(ev) {
  let { sender } = ev;
  if (!chatFilterData.state) return;
  for (const word of chatFilterData.filter) {
    ev.message = ev.message.replace(new RegExp(word, 'g'), '*'.repeat(word.length)); // replace bad characters into *
  }
}



function itemMessageBuilder(item, needs = 'name') {
  return `§c${item.typeId}:${item.data}§r${needs == 'amount' ? `, Amount: ${item.amount}` : ''}${item.nameTag && needs == 'name' ? `, Name: ${safeItemName(item.nameTag)}` : ''}§r`
}

function safeItemName(name) {
  return Util.safeString(name.replace(/\n/g, ''), 25);
}

function getItemPunishment(id) {
  if (config.itemList.ban.includes(id)) return 'ban';
  if (config.itemList.kick.includes(id)) return 'kick';
  if (config.itemList.notify.includes(id)) return 'notify';
  return null;
}

function isSpawnEgg(id = '') {
  return id.startsWith('minecraft:') && id.endsWith('spawn_egg');
}

function isShulkerBox(id = '') {
  return id.startsWith('minecraft:') && id.endsWith('shulker_box');
}

function isIllegalItem(id = '') {
  return config.itemList.ban.includes(id) || config.itemList.kick.includes(id)  || config.itemList.notify.includes(id) 
}