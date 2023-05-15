import { world, system, Player } from '@minecraft/server';
import { VERSION, properties } from './util/constants';
import config from './config.js';
import { Util } from './util/util';
import * as modules from './modules/index';
import { CommandManager } from './managers/CommandManager';
import { AdminPanel } from './modules/AdminPanel';
import { Data, deleteDupe } from './util/Data';

const entityOption = { entityTypes: [ 'minecraft:player' ] };

export class TNAntiCheat {
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
    
    world.sendMessage(`[TN-AntiCheat v${VERSION}] enabled (${Date.now() - this.startTime} ms)`);
    world.sendMessage('§7このワールドは TN-AntiCheat によって保護されています§r');
    
    this.loadConfig();
    checkPlayerJson();
    
    system.runInterval(() => { 
      if (config.entityCheckC.state) {
        world.arrowSpawnCount = 0;
        world.cmdSpawnCount = 0;
      }
      world.entityCheck ??= {};
      
      if (!(system.currentTick % 20)) modules.notify();
      
      for (const player of world.getPlayers()) {
        if (!player.isMoved) modules.checkMoving(player);
        
        modules.crasher(player);
        modules.itemCheck(player);
        
        modules.nukerFlag(player);
        modules.creative(player); 
        modules.speedA(player);
        
        if (!(system.currentTick % 40)) modules.flag(player); // prevent notification spam and causing lag
        if (!(system.currentTick % 100)) modules.ban(player); // tag check
        
        player.breakCount = 0;
        if (player.lastDimensionId !== player.dimension.id) {
          player.lastDimensionId = player.dimension.id;
          player.dimensionSwitchedAt = Date.now();
          player.isMoved = false;
        }
        player.lastLocation = player.location;
      }
      
      if (!(system.currentTick % calcInterval(this.getTPS()))) modules.entityCounter();
      
      const now = Date.now();
      if (this.#lastTick) this.#deltaTimes.push(now - this.#lastTick);
      if (this.#deltaTimes.length > 20) this.#deltaTimes.shift();
      this.#lastTick = now;
    });
    
    world.afterEvents.blockBreak.subscribe(ev => {
      !modules.nukerBreak(ev) &&
      !modules.instaBreak(ev) &&
      modules.reachC(ev);
    });
    
    world.beforeEvents.chatSend.subscribe(ev => this.#chatHandler(ev));
    
    world.afterEvents.entitySpawn.subscribe(ev => {
      modules.entityCheck(ev.entity);
    });
    
    world.beforeEvents.itemUseOn.subscribe(ev => {
      modules.placeCheckA(ev);
      modules.reachB(ev);
      modules.placeCheckD(ev);
      
      modules.getBlock(ev);
    });
    
    
    world.afterEvents.blockPlace.subscribe(ev => {
      modules.placeCheckB(ev);
      modules.placeCheckC(ev);
    });
    
  world.beforeEvents.itemUse.subscribe(async ev => {
      const { itemStack, source } = ev;
      if (
        source instanceof Player &&
        Util.isOP(source) &&
        AdminPanel.isPanelItem(itemStack)
      ) {
        ev.cancel = true;
        const target = source.getEntitiesFromViewDirection({ maxDistance: 24 })[0];
        
        await Util.sleep();
        if (target instanceof Player) new AdminPanel(this, source).playerInfo(target); // show playerInfo
        else new AdminPanel(this, source).show(); // show AdminPanel
      }
    });
    
    world.afterEvents.playerSpawn.subscribe(ev => {
      if (ev.initialSpawn) this.#joinHandler(ev.player);
    });
    
    system.events.scriptEventReceive.subscribe(ev => {
      const { id, sourceEntity, message } = ev;
      if (!(sourceEntity instanceof Player) || id != 'ac:command') return;
      this.commands.handle({ sender: sourceEntity, message }, true);
    }, {
      namespaces: [ 'ac' ]
    });
    
    world.afterEvents.itemReleaseCharge.subscribe(ev => {
      const { itemStack, source } = ev;
      if (itemStack.typeId === 'minecraft:trident') source.threwTridentAt = Date.now();
    });
    
    world.afterEvents.entityHit.subscribe(ev => {
      modules.reachA(ev);
      modules.autoClicker(ev);

    }, entityOption);
  }
  
  /** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
  #chatHandler(ev) {
    const tooFast = modules.spammerC(ev);
    if (!tooFast && this.commands.isCommand(ev.message)) return this.commands.handle(ev);
    
    !tooFast &&
    !modules.spammerA(ev) &&
    !modules.spammerB(ev);
  }
  
  /** @param {import('@minecraft/server').Player} player */
  #joinHandler(player) {
    player.joinedAt = Date.now();
    modules.namespoof(player);
    modules.ban(player);
    modules.banByXuid();
    
    if (player.getDynamicProperty(properties.mute)) {
      const res = Util.runCommandSafe('ability @s mute true', player);
      if (res) Util.notify(`§7あなたはミュートされています`, player);
    }
  }
  
  loadConfig() {
    const data = this.getConfig();
    Data.patch(config, data);
    if (config.others.debug) console.warn('[debug] loaded Config data');
  }
  
  getConfig() {
    const data = Data.fetch();
    
    const res = deleteDupe(data, config);
    if (res.length > 0) {
      Data.save(data);
      if (config.others.debug)  console.warn(`[debug] deleteDupe: ${res.join(', ')}`);
    }
    return data;
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

/** @typedef {import('@minecraft/server').EntityVariantComponent} EntityVariantComponent*/

function checkPlayerJson() { // checks player.json conflict
  const variant = world.getAllPlayers()[0].getComponent('minecraft:variant');
  if (variant.value !== 2048) {
    config.speedA.state = false;
    Util.notify('§cplayer.jsonが正しく読み込まれていないか、他のアドオンのものであるため一部の機能を無効化しました§r');
    if (config.others.debug) console.warn('[debug] disabled: Speed/A, tempkick');
  }
}

function calcInterval(tps) {
  const interval = config.entityCounter.checkInterval;
  if (tps >= 15) return interval;
  if (tps >= 10) return interval * 0.8;
  if (tps >= 5) return interval * 0.4;
  return interval * 0.2;
}