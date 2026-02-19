import { world, system, Player, CommandPermissionLevel } from '@minecraft/server';
import { ModerationManager } from './util/ModerationManager';
import { DataManager, deleteDupe } from './util/DataManager';
import { PermissionType, Permissions } from './util/Permissions';
import { AdminPanel } from './form/AdminPanel';
import { VERSION, PropertyIds } from './util/constants';
import { Util } from './util/util';
import { updateConfig, updateDynamicProperty } from './util/update_scripts';
import { getTPS } from './util/tps';
import { commandHandler } from './lib/exports';
import { COMMANDS } from './commands/index';

import config from './config.js';
import { events } from './events.js';
import * as modules from './modules/index';
import { AdminPanelComponent } from './components/AdminPanelComponent';

const entityOption = { entityTypes: ['minecraft:player'] };

export class TNAntiCheat {
  /** @type {boolean} */
  #isEnabled;

  constructor() {
    console.warn(`[TN-AntiCheat v${VERSION}] loaded`);
    world.loadedAt = Date.now();
    this.#isEnabled = false;

    commandHandler.options.alwaysShowMessage = true;
    commandHandler.options.customPermissionError = 'このコマンドを実行する権限がありません';

    // load system
    Util.awaitWorldLoad()
      .then(() => this.#onWorldLoad())
      .catch((e) => console.error(e, e.stack));

    system.afterEvents.scriptEventReceive.subscribe(
      ({ id, sourceEntity }) => {
        if (!(sourceEntity instanceof Player) || id !== 'ac:start') return;
        this.#register(sourceEntity);
      },
      { namespaces: ['ac'] },
    );

    system.beforeEvents.startup.subscribe(this.#onStartup.bind(this));

    this.#loadSlashCommands();
  }

  get events() {
    return events;
  }

  #loadSlashCommands() {
    for (const command of COMMANDS) {
      command(this);
    }
  }

  #onWorldLoad() {
    updateDynamicProperty();
    if (world.getDynamicProperty(PropertyIds.isRegistered)) {
      try {
        this.#enable();
      } catch (e) {
        console.error(e, e.stack);
      }
    } else {
      world.sendMessage('[§l§aTN-AntiCheat§r] 初めに §6/function start§f を実行してください');
    }
  }

  /** @param {Player} player */
  #register(player) {
    if (world.getDynamicProperty(PropertyIds.isRegistered))
      return player.sendMessage('TNAC is already registered!');

    Permissions.add(player, PermissionType.Admin);

    // BDSではデフォルトの権限レベルが GameDirectors のため Admin に変更
    if (player.commandPermissionLevel === CommandPermissionLevel.GameDirectors)
      player.commandPermissionLevel = CommandPermissionLevel.Admin;

    world.setDynamicProperty(PropertyIds.isRegistered, true);
    this.#enable();
    player.sendMessage('§aAdmin権限が付与されました。"/tn:help" でコマンド一覧を表示します');
  }

  #enable() {
    if (this.#isEnabled) throw new Error('TN-AntiCheat has already enabled');
    this.#isEnabled = true;

    console.warn(`[TN-AntiCheat v${VERSION}] enabled (${Date.now() - world.loadedAt} ms)`);
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
        if (!(system.currentTick % 20)) modules.updatePermissionLevel(player);

        if (!player.isMoved) modules.checkMoving(player);
        if (player.wasGliding && !player.isGliding) player.stopGlideAt = Date.now();

        modules.itemCheck(player);
        modules.nukerFlag(player);
        modules.creative(player);
        modules.speedA(player);
        modules.scaffold.updatePlayerData(player);

        if (!(system.currentTick % 20)) modules.autoClickerCheck(player);
        if (!(system.currentTick % 50)) modules.flag(player); // prevent notification spam and causing lag
        if (!(system.currentTick % 100)) modules.banCheck(player); // tag check

        modules.debugView(player);

        try {
          if (ModerationManager.isFrozen(player)) {
            player.teleport(ModerationManager.getFrozenLocation(player));
            player.addEffect('weakness', 20 * 1, { amplifier: 255, showParticles: false });
          }
        } catch (e) {
          if (config.others.debug) console.error(e, e.stack);
        }

        modules.monitor.onTick(player);

        if (player.lastDimensionId !== player.dimension.id) {
          player.lastDimensionId = player.dimension.id;
          player.dimensionSwitchedAt = Date.now();
          player.isMoved = false;
        }
        player.lastLocation = player.location;
        player.breakCount = 0;
        player.wasGliding = player.isGliding;
      }

      const tps = getTPS();
      if (!(system.currentTick % calcInterval(tps))) modules.entityCounter();

      const tpsToScore = config.others.tpsToScore;
      if (tpsToScore.enabled && !(system.currentTick % tpsToScore.updateInterval)) {
        const objective =
          world.scoreboard.getObjective(tpsToScore.objective) ??
          world.scoreboard.addObjective(tpsToScore.objective, tpsToScore.objective);
        objective.setScore(tpsToScore.name, Math.round(tps));
      }
    });

    world.beforeEvents.playerBreakBlock.subscribe((ev) => {
      const safe = !modules.nukerBreak(ev) && !modules.instaBreak(ev) && !modules.reachC(ev);
      if (safe && Util.isOP(ev.player) && AdminPanel.isPanelItem(ev.itemStack)) ev.cancel = true;
      if (ModerationManager.isFrozen(ev.player)) ev.cancel = true;
    });

    world.beforeEvents.chatSend.subscribe((ev) => this.#handleChat(ev));

    world.afterEvents.entitySpawn.subscribe((ev) => {
      modules.entityCheck(ev.entity);
    });

    world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
      modules.placeCheckA(ev);
      modules.placeCheckD(ev);

      modules.getBlock(ev);
      if (ModerationManager.isFrozen(ev.player)) ev.cancel = true;
    });

    world.beforeEvents.playerPlaceBlock.subscribe((ev) => {
      modules.reachB(ev);
    });

    world.afterEvents.playerPlaceBlock.subscribe((ev) => {
      modules.placeCheckB(ev);
      modules.placeCheckC(ev);
      modules.scaffold.onPlaceBlock(ev);
    });

    world.beforeEvents.itemUse.subscribe(async (ev) => {
      const { source } = ev;

      if (ModerationManager.isFrozen(source)) ev.cancel = true;
    });

    world.afterEvents.playerSpawn.subscribe((ev) => {
      if (ev.initialSpawn) this.#handleJoin(ev.player);
    });

    world.afterEvents.itemReleaseUse.subscribe((ev) => {
      const { itemStack, source } = ev;
      if (itemStack?.typeId === 'minecraft:trident') source.threwTridentAt = Date.now();
    });

    world.afterEvents.entityHitEntity.subscribe((ev) => {
      modules.reachA(ev);
      modules.autoClickerAttack(ev);
    }, entityOption);

    world.beforeEvents.playerInteractWithBlock.subscribe((ev) => {
      if (ModerationManager.isFrozen(ev.player)) ev.cancel = true;
    });

    world.beforeEvents.playerInteractWithEntity.subscribe((ev) => {
      if (ModerationManager.isFrozen(ev.player)) ev.cancel = true;
    });

    world.beforeEvents.entityHurt.subscribe((ev) => {
      const attacker = ev.damageSource?.damagingEntity;
      if (attacker instanceof Player && ModerationManager.isFrozen(attacker)) {
        ev.cancel = true;
      }
    });

    world.beforeEvents.entityItemPickup.subscribe(
      (ev) => {
        if (ev.entity instanceof Player && ModerationManager.isFrozen(ev.entity)) {
          ev.cancel = true;
        }
      },
      {
        // only listen to players picking up items
        entityFilter: {
          type: 'minecraft:player',
        },
      },
    );
  }

  /** @param {import('@minecraft/server').ChatSendBeforeEvent} ev */
  #handleChat(ev) {
    if (!modules.spammerC(ev)) {
      if (!modules.spammerA(ev)) {
        modules.spammerB(ev);
      }
    }
  }

  /** @param {Player} player */
  #handleJoin(player) {
    player.joinedAt = Date.now();
    modules.namespoof(player);
    const banned = modules.banCheck(player);
    if (banned) return;
    modules.xuidBanCheck();
    modules.invalidJoinA(player);

    if (ModerationManager.isMuted(player)) {
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
      if (config.others.debug) console.warn(`[debug] deleteDupe: ${res.join(', ')}`);
    }
    DataManager.patch(config, data);
    if (config.others.debug) console.warn('[debug] loaded Config data');
  }

  /** @param {import('@minecraft/server').StartupEvent} ev */
  #onStartup(ev) {
    ev.itemComponentRegistry.registerCustomComponent(
      AdminPanelComponent.componentName,
      new AdminPanelComponent(),
    );
  }

  /** @returns {import('./types').UnbanQueueEntry[]} */
  getUnbanQueue() {
    return ModerationManager.getUnbanQueue();
  }

  /** @return {typeof config} */
  getConfig() {
    return config;
  }

  /** @type {boolean} */
  get isEnabled() {
    return this.#isEnabled;
  }
}

system.beforeEvents.watchdogTerminate.subscribe((ev) => {
  ev.cancel = true;
});

function checkPlayerJson() {
  // checks player.json conflict
  /** @type {import('@minecraft/server').EntityVariantComponent} */
  const variant = world.getAllPlayers()[0].getComponent('minecraft:variant');
  if (variant?.value !== 2048) {
    config.speedA.state = false;
    Util.notify(
      '§cplayer.jsonが正しく読み込まれていないか、他のアドオンのものであるため一部の機能を無効化しました§r',
    );
    if (config.others.debug) console.warn('[debug] disabled: Speed/A, tempkick');
  }
}

/** @param {number} tps */
function calcInterval(tps) {
  const interval = config.entityCounter.checkInterval;
  if (tps >= 15) return interval;
  if (tps >= 10) return interval * 0.8;
  if (tps >= 5) return interval * 0.4;
  return interval * 0.2;
}
