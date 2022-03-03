import { world, ItemStack, MinecraftItemTypes } from 'mojang-minecraft'
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
  'minecraft:tropical_fish_bucket'
]

let loaded = false;
let detectItem = true;

try {
  world.events.tick.subscribe(data => {
    if (!loaded) {
      try {
        dimension.runCommand('testfor @a');
        loaded = true;
        sendMsg('ac.js loaded');
      } catch {}
    } else {
    
      if (detectItem) {
        for (let player of world.getPlayers()) { // インベントリに入っていたら引っかかるよ
          let container = player.getComponent('minecraft:inventory').container;
          for (let i=0; i<container.size; i++) {
            let item = container.getItem(i);
            if (!item) continue;
            if (detect.includes(item.id)) {
              try {
                container.setItem(i, new ItemStack(MinecraftItemTypes.air));
                player.dimension.runCommand(`kick "${player.name}"`);
                sendMsg(`[AC] §l§c${player.name}§r が禁止アイテム: §c${item.id}§r を所持したためkickしました`);
              } catch {}
            }
          }
        }
      }
      
      
    }
  });
  
  world.events.blockPlace.subscribe(data => { // 設置したら引っかかるよ
    let {block, dimension, player} = data;
    if (detect.includes(block.id)) {
      let {x,y,z} = block.location;
      let id = block.id;
      try {
        block.dimension.runCommand(`setblock ${x} ${y} ${z} air`);
        player.dimension.runCommand(`kick "${player.name}"`);
        sendMsg(`[AC] §l§c${player.name}§r が禁止ブロック: §c${id}§r を設置したためkickしました`);
      } catch {}
    }
  });
  
  world.events.entityCreate.subscribe(data => { // エンティティが出されたら引っかかるよ
    let {id} = data.entity;
    if (detect.includes(id)) {
      try {
        data.entity.kill();
        sendMsg(`[AC] 禁止エンティティ: §c${id}§r を検知したためkillしました`);
      } catch {}
    }
  });
  
  
} catch(e) {
  console.error(e);
}
