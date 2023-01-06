import { Util } from '../util/util';
import config from '../config.js';
import { getItemPunishment, itemMessageBuilder, isSpawnEgg, isIllegalItem } from './util';

export function itemCheck(player) {
  if (Util.isOP(player)) return;
  const { container } = player.getComponent('minecraft:inventory');
  if (config.itemCheckD.state && config.itemCheckD.mode == 'hand') {
    let item = container.getItem(player.selectedSlot);
    if (item) {
      enchantCheck(item, container, player.selectedSlot, player);
    } 
  }
  
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (!item) continue;
    if (config.itemCheckA.state && isIllegalItem(item.typeId)) {
      container.clearItem(i);
      Util.flag(player, 'ItemCheck/A', getItemPunishment(item.typeId), `禁止アイテムの所持を検知しました (${itemMessageBuilder(item)})`, config.itemCheckA.notifyCreative);
      continue;
    }
    if (config.itemCheckB.state && isSpawnEgg(item.typeId)) {
      container.clearItem(i);
      Util.flag(player, 'ItemCheck/B', config.itemCheckB.punishment, `スポーンエッグの所持を検知しました (${itemMessageBuilder(item)})`);
      continue;
    }
    if (config.itemCheckC.state && (item.amount < 1 || config.itemCheckC.maxAmount < item.amount)) {
      container.clearItem(i);
      Util.flag(player, 'ItemCheck/C', config.itemCheckC.punishment, `不正なアイテムの個数を検知しました (${itemMessageBuilder(item, 'amount')})`);
      continue;
    }
    if (config.itemCheckD.state && config.itemCheckD.mode == 'inventory')
      enchantCheck(item, container, i, player);
  }
}

function enchantCheck(item, container, slot, player) {
  const checked = [];
  const enchantment = item.getComponent('enchantments');
  const { enchantments } = enchantment;
  for (const enchant of enchantments) {
    const { level, type } = enchant;
    const { id, maxLevel } = type;
    if (level < 1 || maxLevel < level) {
      enchantments.removeEnchantment(type);
      checked.push({ level, id });
    }
  }
  if (checked.length > 0) {
    enchantment.enchantments = enchantments;
    if (config.itemCheckD.clearItem) container.clearItem(slot)
    else container.setItem(slot, item);
    
    const msg = checked.map(e => `- §7ID: §9${e.id}§7, Level: §9${e.level}§r`);
    const safeMessage = msg.length > 3
      ? msg.slice(0,3).join('\n') + `\n§7${msg.length - 3} more illegal enchants...`
      : msg.join('\n');
    Util.flag(player, 'ItemCheck/D', config.itemCheckD.punishment, `不正なエンチャントレベルを検知しました (§c${item.typeId}§f)\n${safeMessage}`);
  }
}