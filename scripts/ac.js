/*
TNAntiCheat on top!
Made by RetoRuto9900K @tutinoko_kusaa
*/
 
import { world, ItemStack, MinecraftItemTypes, MinecraftBlockTypes, Location } from 'mojang-minecraft'
import { dimension, sendCmd, sendMsg } from './index.js'
import config from './config.js'

let loaded = false;
//let nameRegex = /[^A-Za-z0-9_\-() ]/

let air = MinecraftBlockTypes.air.createDefaultBlockPermutation(); // air permutation
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
         
         if (config.crasher) { // 座標を書き換える系のCrasher対策 間に合うかは不明
           let {x,y,z} = player.location;
           if (Math.abs(x) > 30000000 || Math.abs(y) > 30000000 || Math.abs(z) > 30000000) {
             player.teleport(new Location(0, 255, 0), player.dimension, 0, 0);
             player.kick('Crasherの使用を検知しました');
           }
         }
          
         if (config.tagKick && !player.hasTag('admin')) { // 指定タグがついているプレイヤーにkickコマンド実行
           if (player.hasTag(config.tagKick)) {
             player.kick('You are banned by admin');
           }
         }
         
         if (config.detectItem && !player.hasTag('admin')) { // 禁止アイテムがインベントリに入っていたら引っかかるよ
          let container = player.getComponent('minecraft:inventory').container;
          for (let i=0; i<container.size; i++) {
            let item = container.getItem(i);
            if (!item) continue;
            if (config.detect.includes(item.id) || item.id.endsWith('spawn_egg')) {
              try {
                container.setItem(i, new ItemStack(MinecraftItemTypes.air));
              } catch {}
              let name = item.nameTag ? (item.nameTag.length>20 ? `${item.nameTag.slice(0,20)}§r...` : item.nameTag) : null;
              player.kick(`禁止アイテム: §c${item.id}:${item.data}${name ? `§r, Name: §c${name}§r` : ''} の所持を検知しました`);
            }
          }
        }
        
        if (config.checkName) {
          if (player.name.length > 20) { // 長い名前対策
            player.kick('長すぎる名前を検知しました');
          }
        }
        
        
      } // getPlayers
      
    }
  });
  
  world.events.beforeItemUseOn.subscribe(data => { // 禁止ブロックを設置したら引っかかるよ
    let {source, item} = data;
    if (source.hasTag('admin')) return;
    if (config.detect.includes(item.id)) {
      data.cancel = true;
      source.kick(`禁止アイテム: §c${item.id}:${item.data}§r の使用を検知しました`);
    }
  });
  
  world.events.entityCreate.subscribe(data => { // 禁止エンティティが出されたら引っかかるよ
    let {id} = data.entity;
    if (config.detect.includes(id)) {
      try {
        data.entity.kill();
        sendMsg(`[AC] 禁止エンティティ: §c${id}§r を検知したためkillしました`);
      } catch {}
    }
  });
 
  world.events.beforeChat.subscribe(data => {
    let {sender, message} = data;
    if (message.length > config.chatLength) {
      data.cancel = true;
      sendMsg(`長すぎ (${message.length}>${config.chatLength})`, sender.name);
      return;
    }
    if (config.chatDuplicate) {
      if (sender.chat && message === sender.chat) {
        data.cancel = true;
        sendMsg('重複したチャットは送信できません', sender.name);
      }
      sender.chat = message;
    }
  });
  
  world.events.blockPlace.subscribe(data => { // チェスト設置時に中身をスキャン
    if (!config.detectItem) return;
    let {block,player} = data;
    if (player.hasTag('admin') || block.id != 'minecraft:chest') return;
    let container = block.getComponent('inventory').container;
    let out = []
    for (let i=0; i<container.size; i++) {
      let item = container.getItem(i);
      if (item && config.detect.includes(item?.id)) {
        let name = item.nameTag ? (item.nameTag.length>20 ? `${item.nameTag.slice(0,20)}§r...` : item.nameTag) : null;
        out.push(`Slot:${i}, ID:§c${item.id}:${item.data}${name ? `, Name: ${name}§r` : ''}`);
      }
    }
    if (out.length > 0) {
      block.setPermutation(air);
      player.kick(`禁止アイテム:\n${out.join('\n')}\nの入ったチェストの設置を検知しました`);
    }
  });

} catch(e) {
  console.error(e);
}
