/*
TNAntiCheat on top!
Made by RetoRuto9900K @tutinoko_kusaa
*/
 
import { world, ItemStack, MinecraftItemTypes, MinecraftBlockTypes, MinecraftEnchantmentTypes, Location } from '@minecraft/server';
import { detected } from './util/util';
import config from './config.js';
import './util/timer'; // timer.js v1.1 by lapis256 | https://github.com/Lapis256/timer.js/blob/main/LICENSE
let loaded = false;
let startTime = Date.now();

const airBlock = MinecraftBlockTypes.air.createDefaultBlockPermutation(); // air block permutation
const airItem = new ItemStack(MinecraftItemTypes.stick, 0, 0);

world.events.tick.subscribe(ev => {
  if (!loaded) {
    world.getDimension('overworld').runCommandAsync('testfor @a')
      .then(() => {
        loaded = true;
        world.say(`[TN-AntiCheat] ac.js >> loaded (${Date.now() - startTime}ms)`);
      })
      .catch(() => {});
  } else {
    for (const player of world.getPlayers()) {
       
       if (config.crasher.state) { // Crasher detection by Scythe-AntiCheat
         let {x,y,z} = player.location;
         if (Math.abs(x) > 30000000 || Math.abs(y) > 30000000 || Math.abs(z) > 30000000) {
           player.teleport(new Location(0, 255, 0), player.dimension, 0, 0);
           player.kick('Crasherの使用を検知しました');
         }
       }
        
       if (config.tag.kick && !player.hasTag(config.tag.op)) { // 指定タグがついているプレイヤーにkickコマンド実行
         if (player.hasTag(config.tag.kick)) {
           player.kick('You are banned by admin');
         }
       }
       
       if (config.itemCheck.state && !player.hasTag(config.tag.op)) { // 禁止アイテムがインベントリに入っていたら引っかかるよ
        let { container } = player.getComponent('minecraft:inventory');
        
        if (config.enchantCheck.state && config.enchantCheck.mode == 'hand') {
          let item = container.getItem(player.selectedSlot);
          if (item) {
            let badEnchant = enchantCheck(item);
            if (badEnchant) {
              container.setItem(player.selectedSlot, badEnchant.itemStack);
              detected(`§l§c${player.name}§r >> オーバーエンチャントを検知しました (ID: ${badEnchant.itemStack.typeId}, Enchant: ${badEnchant.id}, Level: ${badEnchant.level})`);
            }
          } 
          
        }
        
        for (let i=0; i<container.size; i++) {
          let item = container.getItem(i);
          if (!item) continue;
          
          if (config.itemCheck.detect.includes(item.typeId) || (config.itemCheck.spawnEgg && item.typeId.endsWith('spawn_egg')) ) {
            container.setItem(i, airItem);
            let name = item.nameTag ? `${item.nameTag.replace(/\n/g, '\\n').slice(0,20)}${item.nameTag.length>20 ? '§r...' : '§r'}` : null
            player.kick(`禁止アイテムの所持を検知しました  (ID: §c${item.typeId}:${item.data}§r${name ? `, Name: ${name}§r` : ''})`);
          }
          
          if (config.enchantCheck.state && config.enchantCheck.mode == 'inventory') {
            let badEnchant = enchantCheck(item);
            if (badEnchant) {
              container.setItem(i, badEnchant.itemStack);
              detected(`§l§c${player.name}§r >> オーバーエンチャントを検知しました (ID: ${badEnchant.itemStack.typeId}, Enchant: ${badEnchant.id}, Level: ${badEnchant.level})`);
            }
          }
        }
      }
      
      if (config.nameCheck.state) {
        if (player.name.length > config.nameCheck.maxLength) { // 長い名前対策
          player.kick('長すぎる名前を検知しました');
        }
      }
      
      if (config.nuker.state && player.breakCount && player.breakCount > config.nuker.limit) {
        let {x,y,z} = player.location;
        player.kick(`Nukerの使用を検知しました [${Math.round(x)} ${Math.round(y)} ${Math.round(z)}] (§c${player.breakCount}blocks§r/tick)`);
      }
      player.breakCount = 0;
    } // getPlayers end 
    
  }
});

world.events.beforeItemUseOn.subscribe(ev => { // 禁止ブロックを設置したら引っかかるよ
  let {source, item} = ev;
  if (source.hasTag(config.tag.op)) return;
  if (config.placeCheck.state && config.placeCheck.detect.includes(item.typeId)) {
    ev.cancel = true;
    source.kick(`禁止アイテムの使用を検知しました (ID: §c${item.typeId}:${item.data}§r)`);
  }
});

const despawnable = [ 'minecraft:command_block_minecart', 'minecraft:npc'];
world.events.entityCreate.subscribe(ev => { // 禁止エンティティが出されたら引っかかるよ
  let {entity} = ev;
  if (config.entityCheck.state && config.entityCheck.detect.includes(entity.typeId)) {
    const id = entity.typeId;
    entity.kill();
    detected(`禁止エンティティを検知したためkillしました (ID: §c${id}§r)`);
    if (despawnable.includes(id)) 
      try { entity.triggerEvent('tn:despawn') } catch {}
    
  } else if (config.itemCheck.drop && entity.typeId == 'minecraft:item') {
    let item = entity.getComponent('item').itemStack;
    if (config.itemCheck.detect.includes(item.typeId)) {
      entity.kill();
      detected(`禁止アイテムを検知したためkillしました (ID: §c${item.typeId}§r) `);
    }
  }
});

world.events.beforeChat.subscribe(ev => {
  let {sender, message} = ev;
  if (config.spamCheck.maxLength > -1 && message.length > config.spamCheck.maxLength) {
    ev.cancel = true;
    sender.tell(`長すぎ (${message.length}>${config.spamCheck.maxLength})`);
    return;
  }
  if (config.spamCheck.duplicate) {
    if (sender.chat && message === sender.chat) {
      ev.cancel = true;
      sender.tell('重複したチャットは送信できません');
    }
    sender.chat = message;
  }
});

world.events.blockPlace.subscribe(ev => { // チェスト設置時に中身をスキャン
  if (!config.containerCheck.state) return;
  let {block,player} = ev;
  if (!config.containerCheck.detect.includes(block.typeId)) return;
  let container = block.getComponent('inventory')?.container;
  if (!container) return;
  let out = [];
  for (let i=0; i<container.size; i++) {
    let item = container.getItem(i);
    if (item && config.itemCheck.detect.includes(item.typeId)) {
      container.setItem(i, airItem);
      let name = item.nameTag ? `${item.nameTag.replace(/\n/g, '\\n').slice(0,20)} ${item.nameTag.length>20 ? '§r...' : '§r'}` : null;
      out.push(`ID: §c${item.typeId}:${item.data}${name ? `§r, Name: §c${name}§r` : ''}`);
    }
  }
  if (out.length > 0) {
    let {x,y,z} = block;
    detected(`§l§c${player.name}§r >> 禁止アイテムの入った ${block.typeId} の設置を検知しました [${x} ${y} ${z}]\n${out.slice(-5).join('\n')}\n${out.length>5 ? `more ${out.length-5} items...` : ''}`);
  }
});

world.events.blockBreak.subscribe(ev => { // Nuker detection by Scythe-AntiCheat
  let {brokenBlockPermutation: permutation, block, player} = ev;
  
  if (config.nuker.state) {
    if (player.breakCount == undefined) player.breakCount = 0;
    player.breakCount++
    
    if (player.breakCount > config.nuker.limit) {
      block.setPermutation(permutation);
    }
  }
});

/**
 *
 * @param {ItemStack} item
 * @return {object} badEnchant
 */
function enchantCheck(item) {
  let enchant = item.getComponent('enchantments');
  let enchantments = enchant.enchantments;
  for (let enchantType of Object.values(MinecraftEnchantmentTypes)) {
    if (!enchantments.hasEnchantment(enchantType)) continue;
    let {level, type: { maxLevel, id }} = enchantments.getEnchantment(enchantType);
    if (level > maxLevel) {
      enchant.removeAllEnchantments();
      return {itemStack:item, id, level} 
    }
  }
  return false;
}
