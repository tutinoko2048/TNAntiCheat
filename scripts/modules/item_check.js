// @ts-check

import { Util } from '../util/util';
import config from '../config.js';
import { getItemPunishment, itemMessageBuilder, isSpawnEgg, isIllegalItem } from './util';
import { EnchantmentList } from '@minecraft/server';

/** @param {import('@minecraft/server').Player} player */
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
        enchantCheck(item, container, i, player);
      
      } else if (config.itemCheckD.mode == 'inventory') {
        enchantCheck(item, container, i, player);
        
      }
    }
  }
}

/** @typedef {import('@minecraft/server').ItemEnchantsComponent} ItemEnchantsComponent */

/**
 * @param {import('@minecraft/server').ItemStack} item
 * @param {import('@minecraft/server').Container} container
 * @param {number} slot
 * @param {import('@minecraft/server').Player} player
 */
function enchantCheck(item, container, slot, player) {
  if (!item) return;
  const levelChecked = [];
  const itemChecked = [];

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
    config.itemCheckD.clearItem ? container.setItem(slot) : container.setItem(slot, item);
    
    const msg = levelChecked.map(e => `- §7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 3
      ? msg.slice(0, 3).join('\n') + `\n§7${msg.length - 3} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/D', config.itemCheckD.punishment, `不正なエンチャントレベルを検知しました (§c${item.typeId}§f)\n${safeMessage}`);
  }
  
  if (itemChecked.length > 0) {
    enchantment.enchantments = enchantments;
    config.itemCheckE.clearItem ? container.setItem(slot) : container.setItem(slot, item);
    
    const msg = itemChecked.map(e => `- §7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 2
      ? msg.slice(0, 2).join('\n') + `\n§7${msg.length - 2} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/E', config.itemCheckE.punishment, `不正なエンチャントを検知しました (${itemMessageBuilder(item)})\n${safeMessage}`);
  }
  
}
