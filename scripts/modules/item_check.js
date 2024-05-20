// @ts-check

import { Util } from '../util/util';
import config from '../config.js';
import { getItemPunishment, itemMessageBuilder, isSpawnEgg, isIllegalItem } from './util';
import { EquipmentSlot, ItemStack, Player } from '@minecraft/server';

/** @typedef {{ flag: boolean, item?: ItemStack | undefined }} EnchantCheckResult */

const ArmorSlots = [ EquipmentSlot.Head, EquipmentSlot.Chest, EquipmentSlot.Legs, EquipmentSlot.Feet ];

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
      if (config.itemCheckD.mode == 'hand' && i === player.selectedSlotIndex) {
        const result = enchantCheck(item, player);
        if (result?.flag) container.setItem(i, result.item); // flagされてたら更新
      
      } else if (config.itemCheckD.mode == 'inventory') {
        const result = enchantCheck(item, player);
        if (result?.flag) container.setItem(i, result.item);
      }
    }
  }
  
  const equippable = player.getComponent('minecraft:equippable');
  for (const slotId of ArmorSlots) {
    const item = equippable.getEquipment(slotId);
    if (!item) continue;
    
    if (config.itemCheckD.state || config.itemCheckE.state) {
      const result = enchantCheck(item, player);
      if (result?.flag) equippable.setEquipment(slotId, result.item); // flagされてたら更新
    }
  }
}

/**
 * @param {ItemStack} item
 * @param {Player} player
 * @returns {EnchantCheckResult | undefined}
 */
function enchantCheck(item, player) {
  const levelChecked = [];
  const itemChecked = [];
  let shouldClearItem = false; // アイテム消すかどうか

  const enchantment = item.getComponent('minecraft:enchantable');
  if (!enchantment) return;
  const _enchantment = new ItemStack(item.type).getComponent('minecraft:enchantable');
  
  for (const enchant of enchantment.getEnchantments()) {
    const { level, type } = enchant;
    if (typeof type === 'string') continue; // ignore when EnchantType is string
    const { id, maxLevel } = type;
    // ItemCheck/E item with illegal enchantment
    if (config.itemCheckE.state && _enchantment && !_enchantment.canAddEnchantment(enchant)) {
      enchantment.removeEnchantment(type);
      itemChecked.push({ level, id });
      continue;
    }
    
    // ItemCheck/D illegal enchantment level
    if (config.itemCheckD.state && (level < 1 || maxLevel < level)) {
      enchantment.removeEnchantment(type);
      levelChecked.push({ level, id });
      continue;
    }
  }
  if (levelChecked.length > 0) {
    if (config.itemCheckD.clearItem) shouldClearItem = true;
    
    const msg = levelChecked.map(e => `- §7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 3
      ? msg.slice(0, 3).join('\n') + `\n§7${msg.length - 3} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/D', config.itemCheckD.punishment, `不正なエンチャントレベルを検知しました (§c${item.typeId}§f)\n${safeMessage}`);
  }
  
  if (itemChecked.length > 0) {
    if (config.itemCheckE.clearItem) shouldClearItem = true;
    
    const msg = itemChecked.map(e => `- §7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 2
      ? msg.slice(0, 2).join('\n') + `\n§7${msg.length - 2} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/E', config.itemCheckE.punishment, `不正なエンチャントを検知しました (${itemMessageBuilder(item)})\n${safeMessage}`);
  }
  
  return {
    flag: levelChecked.length > 0 || itemChecked.length > 0, // setItemかけるかどうか
    item: shouldClearItem ? undefined : item // アイテムを消すか更新するか
  }
}
