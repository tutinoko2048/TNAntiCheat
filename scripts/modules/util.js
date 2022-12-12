import { world } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';

export function itemMessageBuilder(item, needs = 'name') {
  return `§c${item.typeId}:${item.data}§r${needs == 'amount' ? `, Amount: ${item.amount}` : ''}${item.nameTag && needs == 'name' ? `, Name: ${safeItemName(item.nameTag)}` : ''}§r`
}

export function safeItemName(name) {
  return Util.safeString(name.replace(/\n/g, ''), 25);
}

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

export function queueNotify(type, obj) {
  const key = Object.values(obj).join('-');
  if (key in world[type]) {
    world[type][key].count ??= 1;
    return world[type][key].count++
  }
  world[type][key] = obj;
}

export function killDroppedItem(loc, dimension) {
  const items = dimension.getEntities({
    location: new Location(loc.x, loc.y, loc.z),
    maxDistance: 1.5,
    type: 'minecraft:item'
  });
  for (const i of items) i.kill();
}