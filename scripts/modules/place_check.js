import { system, Player, GameMode } from '@minecraft/server';
import config from '../config.js';
import { Util } from '../util/util';
import { getItemPunishment, itemMessageBuilder, isIllegalItem, isShulkerBox, isSpawnEgg } from './util';

/** @param {import('@minecraft/server').ItemUseOnBeforeEvent} ev */
export function placeCheckA(ev) {
  const { source, item } = ev;
  if (!config.placeCheckA.state || !(source instanceof Player) || Util.isOP(source)) return;
  if (isIllegalItem(item?.typeId)) {
    ev.cancel = true;
    Util.flag(source, 'PlaceCheck/A', getItemPunishment(item.typeId), `禁止アイテムの使用を検知しました (${itemMessageBuilder(item)})`, config.placeCheckA.notifyCreative);
  }
  
  if (
    config.placeCheckA.antiShulker &&
    isShulkerBox(item?.typeId) && 
    !config.placeCheckA.shulkerExcludes.some(t => source.hasTag(t))
  ) {
    Util.notify(`§c${item.typeId}§f の使用は許可されていません`, source);
    ev.cancel = true;
  }
}

/** @param {import('@minecraft/server').BlockPlaceAfterEvent} ev */
export function placeCheckB(ev) {
  const { block, player } = ev;
  if (!config.placeCheckB.state || Util.isOP(player)) return;
  if (
    !config.placeCheckB.detect.includes(block.typeId) &&
    (config.placeCheckB.shulkerBox && !isShulkerBox(block.typeId))
  ) return;
  
  const container = block.getComponent('minecraft:inventory')?.container;
  if (!container) return;
  const checkedItems = [];
  
  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (isIllegalItem(item?.typeId) || (config.placeCheckB.spawnEgg && isSpawnEgg(item?.typeId))) {
      checkedItems.push(item);
      container.setItem(i);
    }
  }
  
  player.placeBCount ??= 0;
  if (checkedItems.length > 0) {
    player.placeBCount++
    const mainHand = player.getComponent('minecraft:inventory').container.getSlot(player.selectedSlot);
    system.run(() => {
      if (mainHand.typeId === block.typeId) mainHand.amount = 0;
    });
    
    let flagMsg = checkedItems.slice(0, 2).map(item => `- ${itemMessageBuilder(item)}`).join('\n');
    
    if (config.placeCheckB.flagCount !== -1 && player.placeBCount > config.placeCheckB.flagCount) {
      if (checkedItems.length > 2) flagMsg += `\n§7more ${checkedItems.length - 2} items...`;
      return Util.flag(player, 'PlaceCheck/B', config.placeCheckB.punishment, `${block.typeId} に禁止アイテムが含まれています §7{${player.placeBCount}}§r\n${flagMsg}`);
    }
    
    if (checkedItems.length > 1) {
      flagMsg = itemMessageBuilder(checkedItems[0]);
      flagMsg += `\n§7more ${checkedItems.length - 1} items...`;
    }
    player.flagQueue = `PlaceCheckB >> §c${player.name}§r §7{${player.placeBCount ?? 1}}§r\n${block.typeId} -> ${flagMsg}§　`;
  }
}

/** @param {import('@minecraft/server').BlockPlaceAfterEvent} ev */
export async function placeCheckC(ev) {
  const { block, player } = ev;
  if (!config.placeCheckC.state || !config.placeCheckC.detect.includes(block.typeId) || Util.isOP(player)) return;
  if (config.placeCheckC.excludeCreative && Util.isCreative(player)) return;
  
  const permutation = block.permutation.clone();
  await player.runCommandAsync(`setblock ${block.x} ${block.y} ${block.z} ${block.typeId}`);
  block.setPermutation(permutation);
  if (config.others.debug) console.warn(`[DEBUG] PlaceCheckC: Reset: ${block.typeId}`);
}

const RAILS = [
  'minecraft:rail',
  'minecraft:activator_rail',
  'minecraft:detector_rail',
  'minecraft:golden_rail'
];

/** @param {import('@minecraft/server').ItemUseOnBeforeEvent} ev */
export function placeCheckD(ev) {
  const { source, item } = ev;
  const loc = ev.getBlockLocation();
  if (!config.placeCheckD.state || !(source instanceof Player) || Util.isOP(source)) return;
  const gameMode = Util.getGamemode(source);
  if (config.placeCheckD.excludeCreative && gameMode === GameMode.creative) return;
  
  if (
    config.placeCheckD.minecarts.includes(item?.typeId) &&
    RAILS.includes(source.dimension.getBlock(loc)?.typeId)
  ) {
    ev.cancel = true;
    if (gameMode === GameMode.adventure) return Util.notify(`§cPlaceCheck/D: このトロッコは設置できません`, source);
    source.dimension.spawnEntity(item.typeId, { x: loc.x, y: loc.y+1, z: loc.z });
    
    if (gameMode === GameMode.creative) return;
    item.amount--;
    source.getComponent('minecraft:inventory').container.setItem(source.selectedSlot, item);
    
  } else if (config.placeCheckD.boats.includes(item?.typeId)) {
    ev.cancel = true;
    if (gameMode === GameMode.adventure) return Util.notify(`§cPlaceCheck/D: このボートは設置できません`, source);
    source.dimension.spawnEntity('minecraft:chest_boat', { x: loc.x, y: loc.y+1, z: loc.z });
    
    if (gameMode === GameMode.creative) return;
    item.amount--;
    source.getComponent('minecraft:inventory').container.setItem(source.selectedSlot, item);
  }
}