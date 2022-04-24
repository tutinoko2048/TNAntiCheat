/*
TNAntiCheat on top!
Made by RetoRuto9900K @tutinoko_kusaa
*/
 
import { world, ItemStack, MinecraftItemTypes, MinecraftBlockTypes, Location } from 'mojang-minecraft'
import { dimension, sendCmd, sendMsg } from './index.js'
import config from './config.js'

let loaded = false;

let air = MinecraftBlockTypes.air.createDefaultBlockPermutation(); // air permutation
try {
  world.events.tick.subscribe(ev => {
    //sendCmd('function ac');
    if (!loaded) {
      try {
        dimension.runCommand('testfor @a');
        loaded = true;
        sendMsg('ac.js loaded');
      } catch {}
    } else {
    
      for (let player of world.getPlayers()) {
         
         if (config.crasher) { // Crasher detection by Scythe-AntiCheat
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
          let container = player.getComponent('minecraft:inventory').container;
          for (let i=0; i<container.size; i++) {
            let item = container.getItem(i);
            if (!item) continue;
            if (config.itemCheck.detect.includes(item.id) || (config.itemCheck.spawnEgg && item.id.endsWith('spawn_egg')) ) {
              try {
                container.setItem(i, new ItemStack(MinecraftItemTypes.air));
              } catch {}
              let name = item.nameTag ? (item.nameTag.length>20 ? `${item.nameTag.slice(0,20)}§r...` : item.nameTag) : null;
              player.kick(`禁止アイテム: §c${item.id}:${item.data}${name ? `§r, Name: §c${name}§r` : ''} §rの所持を検知しました`);
            }
          }
        }
        
        if (config.nameCheck.state) {
          if (player.name.length > config.nameCheck.maxLength) { // 長い名前対策
            player.kick('長すぎる名前を検知しました');
          }
        }
        
        player.breakCount = 0;
      } // getPlayers
      
    }
  });
  
  world.events.beforeItemUseOn.subscribe(ev => { // 禁止ブロックを設置したら引っかかるよ
    let {source, item} = ev;
    if (source.hasTag(config.tag.op)) return;
    if (config.placeCheck.state && config.placeCheck.detect.includes(item.id)) {
      ev.cancel = true;
      source.kick(`禁止アイテム: §c${item.id}:${item.data}§r の使用を検知しました`);
    }
  });
  
  world.events.entityCreate.subscribe(ev => { // 禁止エンティティが出されたら引っかかるよ
    let {entity} = ev;
    let id = entity.id;
    if (config.entityCheck.state && config.entityCheck.detect.includes(entity.id)) {
      try {
        entity.runCommand('kill @s');
        sendMsg(`[AC] 禁止エンティティ: §c${id}§r を検知したためkillしました`);
      } catch {}
    }
    
    if (config.itemCheck.state && entity.id == 'minecraft:item') {
      let item = entity.getComponent('item').itemStack;
      if (config.itemCheck.detect.includes(item.id)) {
        try {
          entity.kill();
          sendMsg(`[AC] 禁止アイテム: §c${item.id}§r を検知したためkillしました`);
        } catch {}
      }
    }
  });
 
  world.events.beforeChat.subscribe(ev => {
    let {sender, message} = ev;
    if (config.spamCheck.maxLength < 0) return;
    if (message.length > config.chatLength) {
      ev.cancel = true;
      sendMsg(`長すぎ (${message.length}>${config.spamCheck.maxLength})`, sender.name);
      return;
    }
    if (config.spamCheck.duplicate) {
      if (sender.chat && message === sender.chat) {
        ev.cancel = true;
        sendMsg('重複したチャットは送信できません', sender.name);
      }
      sender.chat = message;
    }
  });
  
  world.events.blockPlace.subscribe(ev => { // チェスト設置時に中身をスキャン
    if (!config.containerCheck.state) return;
    let {block,player} = ev;
    if (config.containerCheck.detect.includes(block.id)) return;
    let container = block.getComponent('inventory')?.container;
    if (!container) return;
    let out = []
    for (let i=0; i<container.size; i++) {
      let item = container.getItem(i);
      if (item && config.itemCheck.detect.includes(item.id)) {
        let name = item.nameTag ? (item.nameTag.length>20 ? `${item.nameTag.slice(0,20)}§r...` : item.nameTag) : null;
        out.push(`ID:§c${item.id}:${item.data}${name ? `§r, Name: §c${name}§r` : ''}`);
      }
    }
    if (out.length > 0) {
      block.setPermutation(air);
      let {x,y,z} = block;
      sendMsg(`禁止アイテム:\n${out.join('\n')}\nの入った ${block.id} の設置を検知しました [${x} ${y} ${z}]`);
    }
  });
  
  world.events.blockBreak.subscribe(ev => { // Nuker detection by Scythe-AntiCheat
    let {brokenBlockPermutation: permutation, block, player} = ev;
    
    if (config.nuker.state) {
      if (player.breakCount == undefined) player.breakCount = 0;
      player.breakCount++
      
      if (player.breakCount > config.nuker.limit) {
        let {x,y,z} = block;
        block.setPermutation(permutation);
        player.kick(`Nukerの使用を検知しました [${Math.round(x)} ${Math.round(y)} ${Math.round(z)}] (§c${player.breakCount}blocks§r/tick)`);
      }
    }
  })

} catch(e) {
  console.error(e);
}
