import { world, system, Player } from '@minecraft/server';
import { VERSION, properties } from './util/constants';
import { events } from './lib/events/index';
import config from './config.js';
import unbanQueue from './unban_queue.js';
import chatFilter from './chat_filter.js';
import { Util } from './util/util';
import * as modules from './modules/index';
import { CommandManager } from './managers/CommandManager';
import { AdminPanel } from './modules/AdminPanel';

export class TNAntiCheat {
  #joinedPlayers;
  #deltaTimes;
  #lastTick;
  
  constructor() {
    console.warn(`[TN-AntiCheat v${VERSION}] loaded`);
    this.startTime = Date.now();
    this.#deltaTimes = [];
    this.#lastTick;
    
    this.commands = new CommandManager(this);
  }
  
  enable() {
    world.say(`[TN-AntiCheat v${VERSION}] enabled (${Date.now() - this.startTime} ms)`);
    this.#loadConfig();
    this.#loadFilter();
    
    system.runSchedule(() => { 
      if (config.entityCheckC.state) {
        world.arrowSpawnCount = 0;
        world.itemSpawnCount = 0;
        world.cmdSpawnCount = 0;
      }
      world.entityCheck ??= {};
      
      if (!(system.currentTick % 20)) modules.notify();
      
      for (const player of world.getAllPlayers()) {
        modules.crasher(player);
        modules.itemCheck(player);
        modules.nukerFlag(player);
        modules.creative(player); 
        
        if (!(system.currentTick % 40)) modules.flag(player); // prevent notification spam and causing lag
        
        player.breakCount = 0;
      }
  
      const now = Date.now();
      if (this.#lastTick) this.#deltaTimes.push(now - this.#lastTick);
      if (this.#deltaTimes.length > 20) this.#deltaTimes.shift();
      this.#lastTick = now;
    });
    
    world.events.blockBreak.subscribe(ev => {
      const isNuker = modules.nukerBreak(ev);
      !isNuker && modules.reach(ev);
    });
    
    world.events.beforeChat.subscribe(ev => this.#chatHandler(ev));
    
    world.events.entityCreate.subscribe(ev => {
      modules.entityCheck(ev.entity);
    });
    
    world.events.beforeItemUseOn.subscribe(ev => {
      modules.placeCheckA(ev);
      modules.reach(ev);
    });
    
    world.events.blockPlace.subscribe(ev => {
      modules.placeCheckB(ev);
      modules.placeCheckC(ev);
    });
    
    world.events.entityHit.subscribe(ev => {
      modules.reach(ev);
      modules.autoClicker(ev);
      
      if (
        ev.entity instanceof Player &&
        ev.hitEntity instanceof Player &&
        Util.isOP(ev.entity) && 
        AdminPanel.isPanelItem(Util.getHoldingItem(ev.entity))
      ) new AdminPanel(this, ev.entity).playerInfo(ev.hitEntity); // show playerInfo
    });
    
    world.events.beforeItemUse.subscribe(ev => {
      if (
        ev.source instanceof Player &&
        Util.isOP(ev.source) &&
        AdminPanel.isPanelItem(ev.item)
      ) {
        new AdminPanel(this, ev.source).show(); // show AdminPanel
        ev.cancel = true;
      }
    });
    
    events.playerSpawn.subscribe(ev => this.#joinHandler(ev.player));
  }
  
  #chatHandler(ev) {
    const tooFast = modules.spammerC(ev);
    if (this.commands.isCommand(ev.message)) {
      !tooFast && this.commands.handle(ev);
      
    } else {
      modules.spammerA(ev);
      modules.spammerB(ev);
      modules.chatFilter(ev);
    }
  }
  
  #joinHandler(player) {
    modules.namespoof(player);
    if (unbanQueue.includes(player.name)) {
      Util.unban(player);
      Util.notify(`§aUnbanned: ${player.name}`);
    }
    if (Util.isBanned(player)) Util.ban(player); // DPとconfigから取得
    for (const xuid of config.permission.ban.xuids) { // xuidを試す
      player.runCommandAsync(`kick "${xuid}" §lKicked by TN-AntiCheat§r\nReason: §aBanned by XUID`).then(() => {
        Util.notify(`BANリストに含まれるXUID: §c${xuid} のプレイヤーをキックしました`);
      });
    }
    if (player.getDynamicProperty(properties.mute)) {
      Util.notify(`§7あなたはミュートされています`, player);
      player.runCommandAsync('ability @s mute true');
    }
  }
  
  #loadConfig() {
    const data = this.#getConfig();
    for (const [k, v] of Object.entries(data)) {
      if (k === 'itemList') {
        for (const [type, array] of Object.entries(v)) {
          if (config.others.debug) console.warn(`[DEBUG] config.itemList.${type} = ${JSON.stringify(array, null, 2)}`);
          config.itemList[type] = array;
        }
      } else {
        if (config.others.debug) console.warn(`[DEBUG] config.${k} = ${JSON.stringify(v, null, 2)}`);
        config[k] = v;
      }
    }
  }
  
  #getConfig() {
    const data = JSON.parse(world.getDynamicProperty(properties.configData) ?? "{}");
    let isDuplicate = false;
    for (const [moduleName, obj] of Object.entries(data)) {
      if (moduleName === 'itemList') {
        for (const [type, array] of Object.entries(obj)) {
          if (isSameObject(config.itemList[type], array)) {
            isDuplicate = true;
            delete data.itemList[type];
          }
        }
      } else {
        if (isSameObject(config[moduleName], obj)) {
          isDuplicate = true;
          delete data[moduleName];
        }
      }
    }
    if (isDuplicate) world.setDynamicProperty(properties.configData, JSON.stringify(data));
    return data;
  }
  
  #loadFilter() {
    const data = JSON.parse(world.getDynamicProperty(properties.chatFilter) ?? "{}");
    for (const [k,v] of Object.entries(data)) {
      chatFilter[k] = v;
    }
    if (config.others.debug) console.warn('[DEBUG] loaded ChatFilter data');
  }
  
  getTPS() {
    return Util.average(this.#deltaTimes.map(n => 1000 / n));
  }
}

function isSameObject(obj1, obj2) { // compare objects
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}