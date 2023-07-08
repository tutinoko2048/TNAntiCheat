// @ts-check

import { Util } from '../util/util';
import config from '../config.js';
import { getItemPunishment, itemMessageBuilder, isSpawnEgg, isIllegalItem } from './util';
import { EnchantmentList, EquipmentSlot } from '@minecraft/server';

/** @typedef {import('@minecraft/server').ItemStack} ItemStack */
/** @typedef {import('@minecraft/server').Player} Player */
/** @typedef {{ flag: boolean, item?: ItemStack | null }} EnchantCheckResult */

const ArmorSlots = [ EquipmentSlot.head, EquipmentSlot.chest, EquipmentSlot.legs, EquipmentSlot.feet ];

/** @param {Player} player */
export function itemCheck(player) {
  if (Util.isOP(player)) return;
  const { container } = player.getComponent('minecraft:inventory');
  
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    // ItemCheck/A illegal item
    if (config.itemCheckA.state && isIllegalItem(item.typeId)) {
      container.setItem(i);
      Util.flag(player, 'ItemCheck/A', getItemPunishment(item.typeId), `禁止アイテムの所持を検知しました (${itemMessageBuilder(item)})`, config.itemCheckA.notifyCreative);
      continue;
    }
    // ItemCheck/B anti spawn egg
    if (config.itemCheckB.state && isSpawnEgg(item.typeId)) {
      container.setItem(i);
      Util.flag(player, 'ItemCheck/B', config.itemCheckB.punishment, `スポーンエッグの所持を検知しました (${itemMessageBuilder(item)})`);
      continue;
    }
    // ItemCheck/C illegal amount
    if (config.itemCheckC.state && (item.amount < 1 || item.maxAmount < item.amount)) {
      container.setItem(i);
      Util.flag(player, 'ItemCheck/C', config.itemCheckC.punishment, `不正なアイテムの個数を検知しました (${itemMessageBuilder(item, 'amount')})`);
      continue;
    }
    
    if (config.itemCheckD.state || config.itemCheckE.state) {
      if (config.itemCheckD.mode == 'hand' && i === player.selectedSlot) {
        const result = enchantCheck(item, i, player);
        if (result.flag) container.setItem(i, result.item); // flagされてたら更新
      
      } else if (config.itemCheckD.mode == 'inventory') {
        const result = enchantCheck(item, i, player);
        if (result.flag) container.setItem(i, result.item);
      }
    }
  }
  
  const equipment = player.getComponent('minecraft:equipment_inventory');
  for (const slotId of ArmorSlots) {
    const item = equipment.getEquipment(slotId);
    if (!item) continue;
    
    if (config.itemCheckD.state || config.itemCheckE.state) {
      const result = enchantCheck(item, slotId, player);
      if (result.flag) equipment.setEquipment(slotId, result.item); // flagされてたら更新
    }
  }
}

/**
 * @param {ItemStack} item
 * @param {number|EquipmentSlot} slot
 * @param {Player} player
 * @returns {EnchantCheckResult}
 */
function enchantCheck(item, slot, player) {
  const levelChecked = [];
  const itemChecked = [];
  let shouldClearItem = false; // アイテム消すかどうか

  const enchantment = item.getComponent('minecraft:enchantments');
  const { enchantments } = enchantment;
  const _enchantments = new EnchantmentList(enchantments.slot);
  
  for (const enchant of enchantments) {
    const { level, type } = enchant;
    const { id, maxLevel } = type;
    // ItemCheck/E item with illegal enchantment
    if (config.itemCheckE.state && _enchantments && !_enchantments.canAddEnchantment(enchant)) {
      enchantments.removeEnchantment(type);
      itemChecked.push({ level, id });
      continue;
    }
    
    // ItemCheck/D illegal enchantment level
    if (config.itemCheckD.state && (level < 1 || maxLevel < level)) {
      enchantments.removeEnchantment(type);
      levelChecked.push({ level, id });
      continue;
    }
  }
  if (levelChecked.length > 0) {
    enchantment.enchantments = enchantments;
    if (config.itemCheckD.clearItem) shouldClearItem = true;
    
    const msg = levelChecked.map(e => `- §7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 3
      ? msg.slice(0, 3).join('\n') + `\n§7${msg.length - 3} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/D', config.itemCheckD.punishment, `不正なエンチャントレベルを検知しました (§c${item.typeId}§f)\n${safeMessage}`);
  }
  
  if (itemChecked.length > 0) {
    enchantment.enchantments = enchantments;
    if (config.itemCheckE.clearItem) shouldClearItem = true;
    
    const msg = itemChecked.map(e => `- §7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 2
      ? msg.slice(0, 2).join('\n') + `\n§7${msg.length - 2} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/E', config.itemCheckE.punishment, `不正なエンチャントを検知しました (${itemMessageBuilder(item)})\n${safeMessage}`);
  }
  
  return {
    flag: levelChecked.length > 0 || itemChecked.length > 0, // setItemかけるかどうか
    item: shouldClearItem ? null : item // アイテムを消すか更新するか
  }
}
