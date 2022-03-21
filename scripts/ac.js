/*
TNAntiCheat on top!
Made by RetoRuto9900K @tutinoko_kusaa
*/
 
import { world, ItemStack, MinecraftItemTypes, Location } from 'mojang-minecraft'
import { dimension, sendCmd, sendMsg } from './index.js'

let detect = [ // ここに書いたブロック,アイテム,エンティティを所持したり設置したり出したりすると検知されるよ
  'minecraft:movingBlock',
  'minecraft:movingblock',
  'minecraft:beehive',
  'minecraft:bee_nest',
  'minecraft:mob_spawner',
  'minecraft:invisiblebedrock',
  'minecraft:npc',
  'minecraft:command_block_minecart',
  'minecraft:tnt',
  'minecraft:lava',
  'minecraft:water',
  'minecraft:lava_bucket',
  'minecraft:axolotl_bucket',
  'minecraft:cod_bucket',
  'minecraft:pufferfish_bucket',
  'minecraft:salmon_bucket',
  'minecraft:tropical_fish_bucket',
  'minecraft:respawn_anchor',
  'minecraft:spawn_egg'
]


let detectItem = true;
let checkPos = true;
let checkName = true;
let blockSign = true;
let tagKick = 'ban'; // タグがついてる人にkickコマンドを実行。何も書かなければ無効化

let loaded = false;
//let nameRegex = /[^A-Za-z0-9_\-() ]/

try {
  world.events.tick.subscribe(data => {
    if (!loaded) {
      try {
        dimension.runCommand('testfor @a');
        loaded = true;
        sendMsg('ac.js loaded');
      } catch {}
    } else {
    
      for (let player of world.getPlayers()) {
         
         if (checkPos) {
           let {x,y,z} = player.location;
           if (Math.abs(x) > 30000000 || Math.abs(y) > 30000000 || Math.abs(z) > 30000000) {
             player.teleport(new Location(0, 255, 0), player.dimension, 0, 0);
             kick(player, `Crasherの使用を検知しました`);
           }
         }
          
         if (tagKick && !player.hasTag('admin')) {
           if (player.hasTag(tagKick)) {
             kick(player, `You are banned by admin`);
           }
         }
         
         if (detectItem && !player.hasTag('admin')) { // インベントリに入っていたら引っかかるよ
          let container = player.getComponent('minecraft:inventory').container;
          for (let i=0; i<container.size; i++) {
            let item = container.getItem(i);
            if (!item) continue;
            if (detect.includes(item.id)) {
              try {
                container.setItem(i, new ItemStack(MinecraftItemTypes.air));
              } catch {}
              kick(player, `禁止アイテム: §c${item.id}:${item.data}§r の所持を検知しました`);
            }
          }
        }
        
        if (checkName) {
          if (player.name.length > 20) {
            kick(player, `長すぎる名前を検知しました`);
          }
        }
        
        
      } // getPlayers
      
    }
  });
  
  world.events.beforeItemUseOn.subscribe(data => { // 禁止ブロックを設置したら引っかかるよ
    let {source, item} = data;
    if (source.hasTag('admin')) return;
    if (blockSign && item.id.endsWith('sign')) {
      data.cancel = true;
      return sendMsg('§c看板の設置は許可されていません', source.name);
    }
    if (detect.includes(item.id)) {
      data.cancel = true;
      kick(source, `禁止アイテム: §c${item.id}§r の使用を検知しました`);
    }
  });
  
  world.events.entityCreate.subscribe(data => { // 禁止エンティティが出されたら引っかかるよ
    let {id} = data.entity;
    if (detect.includes(id)) {
      try {
        data.entity.kill();
        sendMsg(`[AC] 禁止エンティティ: §c${id}§r を検知したためkillしました`);
      } catch {}
    }
  });
  
  function kick(player, reason) {
    if (!player) return console.error('function kick >> No player data');
    if (player.hasTag('admin')) return;
    try {
      player.dimension.runCommand(`kick ${player.name} §f§lKicked by TNAntiCheat\n§cReason: §r${reason || 'N/A'}`); // 普通はこっち
      sendMsg(`[AC] Kicked §l§c${player.name}§r >> ${reason || 'N/A'}`);
    } catch {
      /* (ビヘイビア側でkickすれば§"な名前の人でも蹴れます)
      player.triggerEvent('event_kick'); // 変な名前で蹴れない時はこっち
      sendMsg(`[AC] Kicked §l§c${player.name}§r (addon) >> ${reason || 'N/A'}`);
      */
    }
  }
  
} catch(e) {
  console.error(e);
}
