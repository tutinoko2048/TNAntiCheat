import { world, system, Location } from '@minecraft/server';
import { version, properties } from './util/constants';
import { events } from './lib/events/index';
import config from './config.js';
import unbanQueue from './unbanQueue.js';
import chatFilter from './chatFilter.js';
import { Util } from './util/util';
import * as modules from './modules/index';
import { CommandHandler } from './util/CommandHandler';
import { register } from './commands/register';
import { AdminPanel } from './modules/AdminPanel';

export class TNAntiCheat {
  #joinedPlayers;
  #deltaTimes;
  
  constructor() {
    console.warn(`[TN-AntiCheat v${version}] loaded`);
    this.startTime = Date.now();
    this.commands = new CommandHandler(this);
    register(this.commands);
    this.#deltaTimes = [];
  }
  
  enable() {
    world.say(`[TN-AntiCheat v${version}] enabled (${Date.now() - this.startTime} ms)`);
    this.#loadConfig();
    this.#loadFilter();
    
    world.events.tick.subscribe(({deltaTime}) => { // system.runSchedule(() => { 
      if (config.entityCheckC.state) {
        world.arrowSpawnCount = 0;
        world.itemSpawnCount = 0;
        world.cmdSpawnCount = 0;
      }
      
      for (const player of world.getAllPlayers()) {
        modules.crasher(player);
        if (!Util.isOP(player)) modules.itemCheck(player);
        if (!Util.isOP(player)) modules.nuker(player);
        modules.creative(player); 
        player.breakCount = 0;
        if (!(system.currentTick % 40)) modules.flag(player); // prevent notification spam and causing lag
      }
      
      this.#deltaTimes.push(deltaTime);
      if (this.#deltaTimes.length > 20) this.#deltaTimes.shift();
    });
    
    world.events.blockBreak.subscribe(ev => this.#breakHandler(ev));
    
    world.events.beforeChat.subscribe(ev => this.#chatHandler(ev));
    
    world.events.entityCreate.subscribe(ev => {
      modules.entityCheck(ev.entity);
    });
    
    world.events.beforeItemUseOn.subscribe(ev => {
      if (!Util.isOP(ev.source)) modules.placeCheckA(ev);
      if (!Util.isOP(ev.source)) modules.reach(ev);
    });
    
    world.events.blockPlace.subscribe(ev => {
      if (!Util.isOP(ev.player)) modules.placeCheckB(ev);
    });
    
    world.events.entityHit.subscribe(ev => {
      if (!Util.isOP(ev.entity)) modules.reach(ev);
      if (!Util.isOP(ev.entity)) modules.autoClicker(ev);
      if (
        ev.hitEntity?.typeId === 'minecraft:player' &&
        ev.entity.typeId === 'minecraft:player' &&
        Util.isOP(ev.entity) && 
        AdminPanel.isPanelItem(Util.getHoldingItem(ev.entity))
      ) new AdminPanel(this, ev.entity).playerInfo(ev.hitEntity);
    });
    
    world.events.beforeItemUse.subscribe(ev => {
      if (
        ev.source.typeId == 'minecraft:player' &&
        Util.isOP(ev.source) &&
        AdminPanel.isPanelItem(ev.item)
      ) {
        new AdminPanel(this, ev.source).show();
        ev.cancel = true;
      }
    });
    
    events.playerSpawn.subscribe(ev => this.#joinHandler(ev.player));
  }
  
  #chatHandler(ev) {
    // Check is passed if player is OP or message is command
    const isSpam = Util.isOP(ev.sender)
      ? false
      : modules.spammerC(ev);
    if (this.commands.isCommand(ev.message)) {
      if (!isSpam) this.commands.handle(ev);
      
    } else {
      if (!Util.isOP(ev.sender)) {
        modules.spammerA(ev);
        modules.spammerB(ev);
        modules.chatFilter(ev);
      }
    }
  }
  
  #joinHandler(player) {
    modules.namespoof(player);
    if (unbanQueue.includes(player.name)) {
      Util.unban(player);
      Util.notify(`§aUnbanned: ${player.name}`);
    }
    if (Util.isBanned(player)) Util.ban(player); // DPとconfigから取得
    for (const xuid of config.permission.ban.xuid) { // xuidを試す
      player.runCommandAsync(`kick "${xuid}" §lKicked by TN-AntiCheat§r\nReason: §aX`).then(() => {
        Util.notify(`BANリストに含まれるXUID: §c${xuid} のプレイヤーをキックしました`);
      });
    }
    if (player.getDynamicProperty(properties.mute)) {
      Util.notify(`§7あなたはミュートされています`, player);
      player.runCommandAsync('ability @s mute true');
    }
  }
  
  #breakHandler(ev) { // Nuker detection by Scythe-AC
    const { brokenBlockPermutation: permutation, block, player } = ev;
    player.breakCount ??= 0;
    player.breakCount++
    
    if (Util.isOP(player)) return;
    
    if (config.nuker.state && config.nuker.place && player.breakCount > config.nuker.limit) {
      const { x, y, z } = block;
      block.setPermutation(permutation);
      setTimeout(() => {
        const items = block.dimension.getEntities({
          location: new Location(x, y, z),
          maxDistance: 1.5,
          type: 'minecraft:item'
        });
        for (const i of items) i.kill();
      }, 1);
      return;
    }
    
    modules.reach(ev);
    //modules.autoTool(ev);
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
    return Util.average(this.#deltaTimes.map(n => 1 / n));
  }
}

function isSameObject(obj1, obj2) { // compare objects
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}