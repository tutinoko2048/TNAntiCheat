import { world, system, Player, ScriptEventSource } from '@minecraft/server';
import { VERSION, PropertyIds } from './util/constants';
import config from './config.js';
import { Util } from './util/util';
import * as modules from './modules/index';
import { CommandManager } from './managers/CommandManager';
import { AdminPanel } from './modules/AdminPanel';
import { DataManager, deleteDupe } from './util/DataManager';
import { updateConfig } from './util/update_config';

const entityOption = { entityTypes: [ 'minecraft:player' ] };

export class TNAntiCheat {
  /** @type {number[]} */
  #deltaTimes;
  /** @type {number} */
  #lastTick;
  /** @type {boolean} */
  #isEnabled;
  
  constructor() {
    console.warn(`[TN-AntiCheat v${VERSION}] loaded`);
    this.startTime = Date.now();
    this.#deltaTimes = [];
    this.#lastTick;
    this.#isEnabled;
    
    this.commands = new CommandManager(this);
    
    /** @type {Map<string, import('@minecraft/server').Vector3>} */
    this.frozenPlayerMap = new Map();
  }
  
  enable() {
    if (this.#isEnabled) throw new Error('TN-AntiCheat has already enabled');
    this.#isEnabled = true;
    
    world.sendMessage(`[TN-AntiCheat v${VERSION}] enabled (${Date.now() - this.startTime} ms)`);
    world.sendMessage('§7このワールドは TN-AntiCheat によって保護されています§r');
    
    this.#loadConfig();
    checkPlayerJson();
    
    Util.writeLog({ type: 'load', playerName: 'system', message: 'TNAC has enabled.' });
    
    system.runInterval(() => { 
      if (config.entityCheckC.state) {
        world.arrowSpawnCount = 0;
        world.cmdSpawnCount = 0;
      }
      world.entityCheck ??= {};
      
      if (!(system.currentTick % 20)) modules.notify();
      
      for (const player of world.getPlayers()) {
        if (!player.isMoved) modules.checkMoving(player);
        if (player.wasGliding && !player.isGliding) player.stopGlideAt = Date.now();
        
        modules.itemCheck(player);
        
        modules.nukerFlag(player);
        modules.creative(player); 
        modules.speedA(player);
        modules.flyA(player);
        
        if (!(system.currentTick % 40)) modules.flag(player); // prevent notification spam and causing lag
        if (!(system.currentTick % 100)) modules.ban(player); // tag check
        
        modules.debugView(player, this);
        
        try {
          if (this.frozenPlayerMap.has(player.id)) player.teleport(this.frozenPlayerMap.get(player.id));
        } catch (e) {
          if (config.others.debug) console.error(e, e.stack);
        }
        
        if (player.lastDimensionId !== player.dimension.id) {
          player.lastDimensionId = player.dimension.id;
          player.dimensionSwitchedAt = Date.now();
          player.isMoved = false;
        }
        player.lastLocation = player.location;
        player.breakCount = 0;
        player.wasGliding = player.isGliding;
      }
      
      if (!(system.currentTick % calcInterval(this.getTPS()))) modules.entityCounter();
      
      const now = Date.now();
      if (this.#lastTick) this.#deltaTimes.push(now - this.#lastTick);
      if (this.#deltaTimes.length > 20) this.#deltaTimes.shift();
      this.#lastTick = now;
    });
    
    world.beforeEvents.playerBreakBlock.subscribe(ev => {
      !modules.nukerBreak(ev) &&
      !modules.instaBreak(ev) &&
      modules.reachC(ev);
    });
    
    world.beforeEvents.chatSend.subscribe(ev => this.#handleChat(ev));
    
    world.afterEvents.entitySpawn.subscribe(ev => {
      modules.entityCheck(ev.entity);
    });
    
    world.beforeEvents.itemUseOn.subscribe(ev => {
      modules.placeCheckA(ev);
      modules.reachB(ev);
      modules.placeCheckD(ev);
      
      modules.getBlock(ev);
    });
    
    world.beforeEvents.playerPlaceBlock.subscribe(ev => {
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
        await Util.cancel(ev);
        const target = source.getEntitiesFromViewDirection({ maxDistance: 24 })[0];
        if (target?.entity instanceof Player) new AdminPanel(this, source).playerInfo(target.entity); // show playerInfo
        else new AdminPanel(this, source).show(); // show AdminPanel
      }
    });
    
    world.afterEvents.playerSpawn.subscribe(ev => {
      if (ev.initialSpawn) this.#handleJoin(ev.player);
    });
    
    world.afterEvents.playerLeave.subscribe(ev => {
      this.frozenPlayerMap.delete(ev.playerId);
    });
    
    world.afterEvents.itemReleaseUse.subscribe(ev => {
      const { itemStack, source } = ev;
      if (itemStack.typeId === 'minecraft:trident') source.threwTridentAt = Date.now();
    });
    
    world.afterEvents.entityHitEntity.subscribe(ev => {
      modules.reachA(ev);
      modules.autoClicker(ev);

    }, entityOption);
    
    world.afterEvents.pistonActivate.subscribe(ev => {
      if (!config.flyA.state || !config.flyA.detectPiston) return;
      if (ev.isExpanding) {
        const loc = ev.block.location;
        const nearby = ev.dimension.getPlayers({ location: { ...loc, y: loc.y + 1 }, maxDistance: 3 });
        nearby.forEach(p => p.pistonPushedAt = Date.now());
      }
    });
    
    system.afterEvents.scriptEventReceive.subscribe(ev => {
      const { id, sourceEntity, message, sourceType } = ev;
      if (id !== 'ac:command') return;
      if (sourceEntity instanceof Player && sourceType === ScriptEventSource.Entity) {
        this.commands.handle({ sender: sourceEntity, message }, true);
        
      } else if (!sourceEntity && sourceType === ScriptEventSource.Server) {
        this.commands.handleFromServer({ message });
      }
    }, {
      namespaces: [ 'ac' ]
    });
  }
  
  /** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
  #handleChat(ev) {
    const tooFast = modules.spammerC(ev);
    if (!tooFast && this.commands.isCommand(ev.message)) return this.commands.handle(ev);
    
    !tooFast &&
    !modules.spammerA(ev) &&
    !modules.spammerB(ev);
  }
  
  /** @param {Player} player */
  #handleJoin(player) {
    player.joinedAt = Date.now();
    modules.namespoof(player);
    const banned = modules.ban(player);
    if (banned) return;
    modules.banByXuid();
    
    if (player.getDynamicProperty(PropertyIds.mute)) {
      const res = Util.runCommandSafe('ability @s mute true', player);
      if (res) Util.notify(`§7あなたはミュートされています`, player);
    }
  }
  
  /** configをDPから読み込む */
  #loadConfig() {
    updateConfig(); // アプデ時のデータ移行処理
    
    const data = DataManager.fetch();
    
    const res = deleteDupe(data, config);
    if (res.length > 0) {
      DataManager.save(data);
      if (config.others.debug)  console.warn(`[debug] deleteDupe: ${res.join(', ')}`);
    }
    
    DataManager.patch(config, data);
    if (config.others.debug) console.warn('[debug] loaded Config data');
  }
  
  /** @returns {import('./util/util').UnbanQueueEntry[]} */
  getUnbanQueue() {
    return Util.getUnbanQueue();
  }
  
  /** @return {typeof config} */
  getConfig() {
    return config;
  }
  
  /** @returns {number} */
  getTPS() {
    return Math.min(
      Util.average(this.#deltaTimes.map(n => 1000 / n)),
      20
    );
  }
  
  /** @type {boolean} */
  get isEnabled() {
    return this.#isEnabled;
  }
}

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