import { world } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

/** @param {import('@minecraft/server').ItemStack} item */
export function itemMessageBuilder(item, needs = 'name') {
  return `§c${item.typeId}§r${needs == 'amount' ? ` x${item.amount}`:''}${item.nameTag && needs == 'name' ? `§7, Name: §r${safeItemName(item.nameTag)}`:''}§r`
}

export function safeItemName(name) {
  return Util.safeString(name.replace(/\n/g, ''), 25);
}

/** @returns {import('../util/util').PunishmentType} */
export function getItemPunishment(id) {
  if (config.itemList.ban.includes(id)) return 'ban';
  if (config.itemList.kick.includes(id)) return 'kick';
  if (config.itemList.notify.includes(id)) return 'notify';
  return null;
}

export function isSpawnEgg(id = '') {
  return id.startsWith('minecraft:') && id.endsWith('spawn_egg');
}

export function isShulkerBox(id = '') {
  return id.startsWith('minecraft:') && id.endsWith('shulker_box');
}

export function isIllegalItem(id = '') {
  return config.itemList.ban.includes(id) || config.itemList.kick.includes(id)  || config.itemList.notify.includes(id) 
}

/** @param {import('../types').EntityCheckEntry} data */
export function entityCheckLog(data) {
  const key = Object.values(data).join('-');
  if (key in world.entityCheck) {
    world.entityCheck[key].count ??= 1;
    return world.entityCheck[key].count++
  }
  world.entityCheck[key] = data;
}

/**
 * @param {import('@minecraft/server').Vector3} loc
 * @param {import('@minecraft/server').Dimension} dimension
 */
export function killDroppedItem(loc, dimension) {
  const items = dimension.getEntities({
    location: loc,
    maxDistance: 1.5,
    type: 'minecraft:item'
  });
  for (const i of items) i.remove();
}