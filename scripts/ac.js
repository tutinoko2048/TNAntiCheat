import { world, system, Player } from '@minecraft/server';
import { VERSION, properties } from './util/constants';
import config from './config.js';
import chatFilter from './chat_filter.js';
import { Util } from './util/util';
import * as modules from './modules/index';
import { CommandManager } from './managers/CommandManager';
import { AdminPanel } from './modules/AdminPanel';
import { Data } from 'util/Data';

const entityOption = { entityTypes: [ 'minecraft:player' ] };

export class TNAntiCheat {
  #joinedPlayers;
  #deltaTimes;
  #lastTick;
  #isEnabled;
  
  constructor() {
    console.warn(`[TN-AntiCheat v${VERSION}] loaded`);
    this.startTime = Date.now();
    this.#deltaTimes = [];
    this.#lastTick;
    this.#isEnabled;
    
    this.commands = new CommandManager(this);
  }
  
  enable() {
    if (this.#isEnabled) throw new Error('TN-AntiCheat has already enabled');
    this.#isEnabled = true;
    
    world.say(`[TN-AntiCheat v${VERSION}] enabled (${Date.now() - this.startTime} ms)`);
    world.say('§7このワールドは TN-AntiCheat によって保護されています');
    this.#loadConfig();
    this.#loadFilter();
    this.#checkPlayerJson();
    
    system.runSchedule(() => { 
      if (config.entityCheckC.state) {
        world.arrowSpawnCount = 0;
        world.itemSpawnCount = 0;
        world.cmdSpawnCount = 0;
      }
      world.entityCheck ??= {};
      
      if (!(system.currentTick % 20)) modules.notify();
      
      for (const player of world.getAllPlayers()) {
        if (!player.isMoved) modules.checkMoving(player);
        
        modules.crasher(player);
        modules.itemCheck(player);
        
        modules.nukerFlag(player);
        modules.creative(player); 
        modules.speedA(player);
        
        if (!(system.currentTick % 40)) modules.flag(player); // prevent notification spam and causing lag
        
        player.breakCount = 0;
        if (player.lastDimensionId !== player.dimension.id) {
          player.lastDimensionId = player.dimension.id;
          player.dimensionSwitchedAt = Date.now();
          player.isMoved = false;
        }
        
        player.lastLocation = player.location;
      }
      
      const now = Date.now();
      if (this.#lastTick) this.#deltaTimes.push(now - this.#lastTick);
      if (this.#deltaTimes.length > 20) this.#deltaTimes.shift();
      this.#lastTick = now;
    });
    
    world.events.blockBreak.subscribe(ev => {
      !modules.nukerBreak(ev) &&
      !modules.instaBreak(ev) &&
      modules.reachC(ev);
    });
    
    world.events.beforeChat.subscribe(ev => this.#chatHandler(ev));
    
    world.events.entitySpawn.subscribe(ev => {
      modules.entityCheck(ev.entity);
    });
    
    world.events.beforeItemUseOn.subscribe(ev => {
      modules.placeCheckA(ev);
      modules.reachB(ev);
      modules.placeCheckD(ev);
    });
    
    world.events.blockPlace.subscribe(ev => {
      modules.placeCheckB(ev);
      modules.placeCheckC(ev);
    });
    
    world.events.beforeItemUse.subscribe(ev => {
      if (
        ev.source instanceof Player &&
        Util.isOP(ev.source) &&
        AdminPanel.isPanelItem(ev.item)
      ) {
        const target = ev.source.getEntitiesFromViewDirection({ maxDistance: 24 })[0];
        if (target instanceof Player) new AdminPanel(this, ev.source).playerInfo(target); // show playerInfo
        else new AdminPanel(this, ev.source).show(); // show AdminPanel
        ev.cancel = true;
      }
    });
    
    world.events.playerSpawn.subscribe(ev => {
      if (ev.initialSpawn) this.#joinHandler(ev.player);
    });
    
    system.events.scriptEventReceive.subscribe(ev => {
      const { id, sourceEntity, message, sourceType } = ev;
      if (!(sourceEntity instanceof Player) || id != 'ac:command') return;
      this.commands.handle({ sender: sourceEntity, message }, true);
    }, {
      namespaces: [ 'ac' ]
    });
    
    world.events.itemReleaseCharge.subscribe(ev => {
      const { itemStack, source } = ev;
      if (itemStack.typeId === 'minecraft:trident') {
        source.threwTridentAt = Date.now();
      }
    });
  }
  
  #chatHandler(ev) {
    const tooFast = modules.spammerC(ev);
    if (!tooFast && this.commands.isCommand(ev.message)) return this.commands.handle(ev);
    
    !tooFast &&
    !modules.spammerA(ev) &&
    !modules.spammerB(ev) &&
    modules.chatFilter(ev);
  }
  
  #joinHandler(player) {
    player.joinedAt = Date.now();
    modules.namespoof(player);
    modules.ban(player);
    
    if (player.getDynamicProperty(properties.mute)) {
      Util.notify(`§7あなたはミュートされています`, player);
      player.runCommandAsync('ability @s mute true');
    }
  }
  
  #loadConfig() {
    const data = this.#getConfig();
    Data.patch(data, 'config');
    if (config.others.debug) console.warn('[DEBUG] loaded Config data');
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
    Data.patch(data, 'filter');
    if (config.others.debug) console.warn('[DEBUG] loaded ChatFilter data');
  }
  
  #checkPlayerJson() { // checks player.json conflict
    const variant = world.getAllPlayers()[0].getComponent('minecraft:variant').value;
    if (variant !== 2048) {
      config.speedA.state = false;
      Util.notify('§cplayer.jsonが正しく読み込まれていないか、他のアドオンのものであるため一部の機能を無効化しました');
      console.warn('disabled: Speed/A, tempkick');
    }
  }
  
  getTPS() {
    return Math.min(
      Util.average(this.#deltaTimes.map(n => 1000 / n)),
      20
    );
  }
  
  get isEnabled() {
    return this.#isEnabled;
  }
}

function isSameObject(obj1, obj2) { // compare objects
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}