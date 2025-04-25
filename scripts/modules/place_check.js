import { system, GameMode } from '@minecraft/server';
import config from '../config.js';
import { Util } from '../util/util';
import { getItemPunishment, itemMessageBuilder, isIllegalItem, isShulkerBox, isSpawnEgg } from './util';

/** @param {import('@minecraft/server').PlayerInteractWithBlockBeforeEvent} ev */
export function placeCheckA(ev) {
  const { player, itemStack: item } = ev;
  if (!config.placeCheckA.state || Util.isOP(player)) return;
  if (isIllegalItem(item?.typeId)) {
    ev.cancel = true;
    system.run(() => {
      Util.flag(player, 'PlaceCheck/A', getItemPunishment(item.typeId), `禁止アイテムの使用を検知しました (${itemMessageBuilder(item)})`, config.placeCheckA.notifyCreative);
    });
  }
}

/** @param {import('@minecraft/server').PlayerPlaceBlockAfterEvent} ev */
export async function placeCheckB(ev) {
  const { block, player } = ev;
  if (!config.placeCheckB.state || Util.isOP(player)) return;
  if (
    !config.placeCheckB.detect.includes(block.typeId) &&
    (config.placeCheckB.shulkerBox && !isShulkerBox(block.typeId))
  ) return;
  
  const container = block.getComponent('minecraft:inventory')?.container;
  if (!container) return;
  
  /** @type {{ item: import('@minecraft/server').ItemStack, slot: number }[]} */
  const checkedItems = [];
  
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (isIllegalItem(item?.typeId) || (config.placeCheckB.spawnEgg && isSpawnEgg(item?.typeId))) {
      checkedItems.push({ item, slot: i });
    }
  }
  
  player.placeBCount ??= 0;
  if (checkedItems.length > 0) {
    player.placeBCount++
    const mainHand = player.getComponent('minecraft:inventory').container.getSlot(player.selectedSlotIndex);
    system.run(() => {
      if (mainHand.typeId === block.typeId) mainHand.setItem();
    });
    
    let flagMsg = checkedItems.slice(0, 2).map(entry => `- ${itemMessageBuilder(entry.item)}`).join('\n');
    
    if (config.placeCheckB.flagCount !== -1 && player.placeBCount > config.placeCheckB.flagCount) {
      if (checkedItems.length > 2) flagMsg += `\n§7more ${checkedItems.length - 2} items...`;
      return Util.flag(player, 'PlaceCheck/B', config.placeCheckB.punishment, `${block.typeId} に禁止アイテムが含まれています §7{${player.placeBCount}}§r\n${flagMsg}`);
    }
    
    if (checkedItems.length > 1) {
      flagMsg = itemMessageBuilder(checkedItems[0].item);
      flagMsg += `\n§7more ${checkedItems.length - 1} items...`;
    }
    player.flagQueue = `PlaceCheckB >> §c${player.name}§r §7{${player.placeBCount ?? 1}}§r\n${block.typeId} -> ${flagMsg}§ `;

    for (const entry of checkedItems) { // clear items
      container.setItem(entry.slot);
    }
  }
}

/** @param {import('@minecraft/server').PlayerPlaceBlockAfterEvent} ev */
export function placeCheckC(ev) {
  const { block, player } = ev;
  if (!config.placeCheckC.state || !config.placeCheckC.detect.includes(block.typeId) || Util.isOP(player)) return;
  if (config.placeCheckC.excludeCreative && Util.isCreative(player)) return;
  
  const permutation = block.permutation;
  player.runCommand(`setblock ${block.x} ${block.y} ${block.z} ${block.typeId}`);
  block.setPermutation(permutation);
  if (config.others.debug) console.warn(`[DEBUG] PlaceCheckC: Reset: ${block.typeId}`);
}

const RAILS = [
  'minecraft:rail',
  'minecraft:activator_rail',
  'minecraft:detector_rail',
  'minecraft:golden_rail'
];

/** @param {import('@minecraft/server').PlayerInteractWithBlockBeforeEvent} ev */
export async function placeCheckD(ev) {
  const { player, itemStack: item, block } = ev;
  const loc = block.location;
  if (!config.placeCheckD.state || Util.isOP(player)) return;
  const gameMode = player.getGameMode();
  if (config.placeCheckD.excludeCreative && gameMode === GameMode.creative) return;
  const { container } = player.getComponent('minecraft:inventory');

  const spawn = (typeId) => {
    try {
      const e = player.dimension.spawnEntity(typeId, { x: loc.x, y: loc.y + 1, z: loc.z });
      e.setRotation({ x: 0, y: player.getRotation().y });
    } catch (e) {
      if (config.others.debug) console.error(e);
    }
  }
  
  if (
    config.placeCheckD.minecarts.includes(item?.typeId) &&
    RAILS.includes(block.typeId)
  ) {
    await Util.cancel(ev);
    if (gameMode === GameMode.adventure) return Util.notify(`§cPlaceCheck/D: このトロッコは設置できません`, player);
    spawn(item.typeId);
    
    if (gameMode === GameMode.creative) return;
    if (item.amount === 1) {
      container.setItem(player.selectedSlotIndex);
    } else {
      item.amount--;
      container.setItem(player.selectedSlotIndex, item);
    }
    
  } else if (config.placeCheckD.boats.includes(item?.typeId)) {
    await Util.cancel(ev);
    if (gameMode === GameMode.adventure) return Util.notify(`§cPlaceCheck/D: このボートは設置できません`, player);
    spawn('minecraft:chest_boat');
    if (gameMode === GameMode.creative) return;
    if (item.amount === 1) {
      container.setItem(player.selectedSlotIndex);
    } else {
      item.amount--;
      container.setItem(player.selectedSlotIndex, item);
    }
  }
}