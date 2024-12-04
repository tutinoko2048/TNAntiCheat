import { world, ItemStack, ItemTypes, EquipmentSlot, Player, ScoreboardObjective, InputMode } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { Util } from '../util/util';
import config from '../config.js';
import { Icons, panelItem } from '../util/constants';
import { FORMS, confirmForm } from './static_form';
import { PermissionType, Permissions } from '../util/Permissions';
import { ConfigPanel } from './ConfigPanel';
import { ActionForm } from '../lib/form/index';
import { editLore, editNameTag } from './ItemEditor';
import { BanManager } from '../util/BanManager';
import { Duration } from '../lib/duration/main';
import { getTPS } from '../util/tps';

const inputModeMap = {
  [InputMode.KeyboardAndMouse]: 'KeyboardMouse',
  [InputMode.Gamepad]: 'Controller',
  [InputMode.Touch]: 'Touch',
  [InputMode.MotionController]: 'MotionController'
}

/** @typedef {{ slot: import('@minecraft/server').ContainerSlot, slotId: EquipmentSlot | number }} ItemInformation */

/** @enum {'NameTag' | 'Lore'} */
const EditItemAction = /** @type {const} */ ({
  NameTag: 'NameTag',
  Lore: 'Lore'
});

export class AdminPanel {
  /**
   * @param {import('../ac').TNAntiCheat} ac 
   * @param {Player} player 
   */
  constructor(ac, player) {
    if (!(player instanceof Player)) throw TypeError('Argument "player" must be a player instance');
    this.ac = ac;
    this.player = player;
  }
  
  show(busy) {
    if (Util.isOP(this.player)) this.main(busy).catch(e => console.error(e, e.stack));
      else Util.notify('§c権限がありません', this.player)
  }
  
  async main(busy) {
    const info = [
      'TN-AntiCheatの管理者用パネルです\n',
      '§l§b--- World Info ---',
      `§l§7現在時刻: §r${Util.getTime()}`,
      `§l§7ワールド経過時間: §r${Util.parseMS(Date.now() - this.ac.startTime)}`,
      `§l§7プレイヤー数: §r${world.getPlayers().length}`,
      `§l§7TPS: §r${getTPS().toFixed(1)}`,
    ].join('§r\n');
    const form = FORMS.main().body(`${info}\n `);
    const { selection, canceled } = busy
      ? await Util.showFormToBusy(this.player, form)
      : await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerList();
    if (selection === 1) return await this.showEntities();
    if (selection === 2) return await this.configPanel();
    if (selection === 3) return await this.actionLogs();
    if (selection === 4) return await manageUnbanQueue(this.player);
    if (selection === 5) return await this.about();
  }
  
  async playerList() {
    const perm = (p) => Util.isOP(p) ? '§2[OP]' : Permissions.has(p, PermissionType.Builder) ? '§6[Builder]' : null;
    const icon = (p) => Util.isOP(p) ? Icons.op : Permissions.has(p, PermissionType.Builder) ? Icons.builder : Icons.member;
    const players = world.getPlayers().sort((a,b) => a.name.localeCompare(b.name));
    const form = new UI.ActionFormData();
    for (const p of players) form.button(
      perm(p) ? `${perm(p)}§8 ${p.name}` : p.name,
      icon(p)
    );
    form.body(`§7Players: §f${players.length}`)
      .title('プレイヤーリスト / Player List')
      .button('戻る / Return', Icons.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === players.length) return await this.main(); // return button
    return await this.playerInfo(players[selection]);
  }
  
  /**
   * @param {Player} target
   * @param {string} [message]
   */
  async playerInfo(target, message) {
    const { x, y, z } = Util.vectorNicely(target.location);
    const { currentValue, effectiveMax } = target.getComponent('minecraft:health');
    const perm = (p) => Util.isOP(p) ? '§aOP§f' : Permissions.has(p, PermissionType.Builder) ? '§eBuilder§f' : 'Member';
    const bool = (v) => v ? '§atrue§r' : '§cfalse§r';
    const info = [
      `§7Name: §f${target.name}`,
      `§7ID: §f${target.id}`,
      `§7Location: §f${x}, ${y}, ${z} (${target.dimension.id.replace('minecraft:', '')})`,
      `§7GameMode: §f${target.getGameMode()}`,
      `§7Platform: §f${target.clientSystemInfo.platformType} (${inputModeMap[target.inputInfo.lastInputModeUsed]})`,
      `§7Health: §f${Math.floor(currentValue)} / ${effectiveMax}`,
      `§7Permission: §f${perm(target)}`,
      target.joinedAt ? `§7JoinedAt: §f${Util.getTime(target.joinedAt)}` : null,
      `§7isFrozen: ${bool(this.ac.frozenPlayerMap.has(target.id))}`,
      `§7isMuted: ${bool(BanManager.isMuted(target))}`
    ].filter(Boolean).join('\n');
    const form = FORMS.playerInfo().body(`${message ? `${message}§r\n\n` : ''}${info}\n `);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.showInventory(target);
    if (selection === 1) return await this.managePermission(target);
    if (selection === 2) return await this.kickPlayer(target);
    if (selection === 3) return await this.banPlayer(target);
    if (selection === 4) return await this.manageAbility(target);
    if (selection === 5) {
      this.player.teleport(target.location, { dimension: target.dimension, rotation: target.getRotation() });
      Util.notify(`${target.name} §rにテレポートしました §7[${x}, ${y}, ${z}]§r`, this.player);
      return await this.playerInfo(target);
    }
    if (selection === 6) {
      target.teleport(this.player.location, { dimension: this.player.dimension, rotation: this.player.getRotation() });
      Util.notify(`${target.name} §rをテレポートさせました`, this.player);
      return await this.playerInfo(target);
    }
    if (selection === 7) return await this.showTags(target);
    if (selection === 8) return await this.showScores(target);
    if (selection === 9) return await this.playerList(); // back
  }
  
  /**
   * @param {Player} target
   * @param {string} [message]
   */
  async showInventory(target, message) {
    /** @type {ItemInformation[]} */
    const slotList = getAllSlots(target).filter(info => info.slot?.hasItem());
   
    const form = new ActionForm();
    form.button('§l§1更新 / Reload', Icons.reload, 'reload');
    if (slotList.length === 0) form.body('何も持っていないようです\n ');
    slotList.forEach((info, index) =>
      form.button(`§0${Util.safeString(info.slot.typeId, 30)}${typeof info.slotId === 'string' ? ' ':''}\n§8slot: ${info.slotId}, amount: ${info.slot.amount}`, null, index)
    );
    form.title(`${target.name}'s inventory`)
      .button('§l§c全て削除 / Clear all', Icons.clear, 'clear')
      .button('§l§cエンダーチェストをクリア / Clear enderchest', Icons.enderchest, 'ender')
      .button('戻る / Return', Icons.returnBtn, 'back');
    if (message) form.body(message);
    const { canceled, button } = await form.show(this.player);
    if (canceled) return;
    
    if (button.id === 'reload') return this.showInventory(target);
    if (button.id === 'clear') {
      const res = await confirmForm(this.player, {
        body: `§l§c${target.name}§r の全てのアイテムを削除しますか？`,
        yes: '§c削除する', no: '§lキャンセル'
      });
      if (res) {
        target.runCommand('clear @s');
        Util.notify(`${target.name} の全てのアイテムを削除しました`, this.player);
      } else return await this.showInventory(target);
      
    } else if (button.id === 'ender') {
      const res = await confirmForm(this.player, {
        body: `§l§c${target.name}§r のエンダーチェストの全てのアイテムを削除しますか？`,
        yes: '§c削除する', no: '§lキャンセル'
      });
      if (res) {
        target.runCommand('function util/clear_ec');
        Util.notify(`${target.name} のエンダーチェストの全てのアイテムを削除しました`, this.player);
      } else return await this.showInventory(target);
      
    } else if (button.id === 'back') {
      return await this.playerInfo(target);
      
    } else {
      /** @type {ItemInformation} */
      const info = slotList[button.id];
      if (!info.slot.getItem()) return await this.showInventory(target, '§cError: アイテムが移動されています');
      return await this.itemInfo(target, info);
    }
  }
  
  /**
   * @param {Player} target 
   * @param {ItemInformation} info 
   */
  async itemInfo(target, info) {
    const item = info.slot.getItem(); // cache item
    const form = FORMS.itemInfo().body([
      `§7owner: §r${target.name}`,
      `§7item: §r${item.typeId}`,
      `§7slot: §r${info.slotId}${typeof info.slotId === 'number' ? '' : ' '}`,
      `§7amount: §r${item.amount}`,
      `§7nameTag: §r${item.nameTag?.replace(/\n/g, '\\n') ?? '§7-'}`,
      `§r`
    ].join('§r\n'));
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    
    // form開いてる間に移動された時の対策
    if (item.typeId !== (info.slot.hasItem() && info.slot.typeId)) return await this.showInventory(target, '§cError: アイテムが移動されています');

    if (selection === 0) { // delete item
      info.slot.setItem();
      Util.notify(`[${target.name}] ${item.typeId} §7(slot: ${info.slotId})§r を削除しました`, this.player);
    }
    if (selection === 1) return await this.transferItem(target, info);
    if (selection === 2) return await this.editItem(target, info, EditItemAction.NameTag);
    if (selection === 3) return await this.editItem(target, info, EditItemAction.Lore);
    if (selection === 4) return await this.showInventory(target); // back
  }

  /**
   * @param {Player} source 
   * @param {ItemInformation} info 
   */
  async transferItem(source, info) {
    const item = info.slot.getItem();
    const players = world.getPlayers();
    players.sort((a, b) => a.name.localeCompare(b.name));
    players.sort(p => p.id === this.player.id ? -1 : 1); // 自分の名前を1番上に

    const form = new UI.ModalFormData();
    form.title(`Transfer Item [${item.typeId}]`);
    form.dropdown('転送先 / Target', players.map(p => p.name), 0);
    form.toggle('アイテムを複製 / Duplicate item', false);
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return await this.showInventory(source);

    if (item.typeId !== (info.slot.hasItem() && info.slot.typeId)) return await this.showInventory(source, '§cError: アイテムが移動されています');

    const targetIndex = /** @type {number} */ (formValues[0]);
    const duplicate = /** @type {boolean} */ (formValues[1]);
    const target = players[targetIndex];
    target.getComponent('minecraft:inventory').container.addItem(item);

    if (!duplicate) info.slot.setItem();

    Util.notify(
      `[${source.name}§r >> ${target.name}§r] ${item.typeId} §7(slot: ${info.slotId})§r を${duplicate ? '複製' : '転送'}しました`,
      this.player
    );
  }

  /**
   * @param {Player} target 
   * @param {ItemInformation} info 
   * @param {EditItemAction} action 
   */
  async editItem(target, info, action) {
    const item = info.slot.getItem();
    let isChanged;
    if (action === EditItemAction.NameTag) isChanged = await editNameTag(this.player, item);
    if (action === EditItemAction.Lore) isChanged = await editLore(this.player, item);

    if (item.typeId !== (info.slot.hasItem() && info.slot.typeId)) return await this.showInventory(target, '§cError: アイテムが移動されています');

    if (isChanged) info.slot.setItem(item);
    return await this.itemInfo(target, info);
  }

  /** @param {Player} player */
  async managePermission(player) {
    const _builder = Permissions.has(player, PermissionType.Builder);
    const _admin = Permissions.has(player, PermissionType.Admin);
    const form = new UI.ModalFormData();
    form.title('Manage Permissions')
      .toggle('§l§eBuilder§r - クリエイティブを許可します', _builder)
      .toggle('§l§aAdmin (OP)§r - アンチチートの管理権限です', _admin);
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return;
    const [ builder, admin ] = /** @type {boolean[]} */ (formValues);
    if (builder != _builder) {
      Permissions.set(player, PermissionType.Builder, builder);
      Util.notify(`§7${this.player.name} >> §e${player.name} の permission:builder を ${builder ? '§a':'§c'}${builder}§e に設定しました`);
      Util.writeLog({ type: 'panel.permission', message: `§epermission:builder を §f${builder} §eに設定しました§r\nExecuted by ${this.player.name}` }, player);
    }
    if (admin != _admin) {
      Permissions.set(player, PermissionType.Admin, admin);
      Util.notify(`§7${this.player.name} >> §e${player.name} の permission:admin を ${admin ? '§a':'§c'}${admin}§e に設定しました`);
      Util.writeLog({ type: 'panel.permission', message: `§epermission:admin を §f${admin} §eに設定しました§r\nExecuted by ${this.player.name}` }, player);
    }
    return await this.playerInfo(player);
  }
  
  /** @param {Player} target */
  async manageAbility(target) {
    const _mute = BanManager.isMuted(target);
    const _freeze = this.ac.frozenPlayerMap.has(target.id);
    const form = new UI.ModalFormData();
    form.title('Manage Abilities');
    form.toggle('ミュート / Mute', _mute);
    form.toggle('フリーズ / Freeze', _freeze);
    const { formValues, canceled } = await form.show(this.player);
    if (canceled) return;
    const [ mute, freeze ] = formValues;
    
    if (mute !== _mute) {
      const res = BanManager.setMuted(target, /** @type {boolean} */(mute));
      if (!res) return Util.notify(`§c${target.name}§r§c のミュートに失敗しました (Education Editionがオフになっている可能性があります)`, this.player);
      Util.notify(`§7${this.player.name}§r§7 >> ${target.name} のミュートを ${mute} に設定しました`);
      if (mute) Util.notify('§o§eあなたはミュートされています', target);
      Util.writeLog({ type: 'panel.mute', message: `MuteState: ${freeze}\nExecuted by ${this.player.name}` }, target);
    }
    
    if (freeze !== _freeze) {
      target.inputPermissions.movementEnabled = !freeze;
      target.inputPermissions.cameraEnabled = !freeze;
      if (freeze) this.ac.frozenPlayerMap.set(target.id, target.location);
        else this.ac.frozenPlayerMap.delete(target.id);
      Util.notify(`§7${this.player.name}§r§7 >> ${target.name} のフリーズを ${freeze} に設定しました`);
      if (freeze) Util.notify('§o§eあなたはフリーズされています', target);
      Util.writeLog({ type: 'panel.freeze', message: `FreezeState: ${freeze}\nExecuted by ${this.player.name}` }, target);
    }
    return await this.playerInfo(target);
  }

  /** @param {Player} target */
  async kickPlayer(target) {
    const form = new UI.ModalFormData();
    form.title(`Kick >> ${target.name}`);
    form.textField('理由 / Reason', 'reason');
    
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return await this.playerInfo(target);
    const reason = /** @type {string} */ (formValues[0]);
    const message = `§7Reason: ${reason || '-'}`;

    const res = BanManager.kick(target, message, false, false);
    if (!res) return Util.notify('§ckickに失敗しました', this.player);
    Util.notify(`§7${this.player.name} >> §c${target.name}§r をkickしました\n${message}`);
    Util.writeLog({ type: 'panel.kick', message: `Kicked by ${this.player.name}\n${message}` }, target);
  }
  
  /** @param {Player} target */
  async banPlayer(target) {
    /** @type {{ name: string, suffix: import('../lib/duration/main').Duration.List }[]} */
    const timeUnits = [
      { name: '無期限 / Permanent', suffix: null },
      { name: '分 / Minutes', suffix: 'm' },
      { name: '時 / Hours', suffix: 'h' },
      { name: '日 / Days', suffix: 'd' },
      { name: '週 / Weeks', suffix: 'w' },
      { name: '年 / Years', suffix: 'y' },
    ];
    if (target.id === this.player.id) return this.playerInfo(target, '§o§cError: 自分をbanすることはできません');
    const form = new UI.ModalFormData();
    form.title(`Ban >> ${target.name}`);
    form.textField('理由 / Reason', 'reason');
    form.dropdown('単位 / Unit', timeUnits.map(u => u.name), 0);
    form.slider('長さ / Duration', 1, 60, 1);
    
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return await this.playerInfo(target);
    const reason = /** @type {string} */ (formValues[0]);
    const unit = timeUnits[/** @type {number} */ (formValues[1])];
    const duration = /** @type {number} */ (formValues[2]);
    const ms = Duration.toMS(`${duration}${unit.suffix}`);
    const isPermanent = unit.suffix === null || ms === 0;
    const expireAt = Date.now() + ms;
    const message = [
      `§7Reason: §f${reason || '-'}`,
      isPermanent ? null : `§7ExpireAt: §r${Util.getTime(expireAt, true)} (${Util.formatDuration(ms)})`
    ].filter(Boolean).join('\n');

    BanManager.ban(target, {
      reason, message,
      expireAt: isPermanent ? undefined : expireAt,
      forceKick: false
    });
    Util.notify(`§7${this.player.name} >> §c${target.name}§r をbanしました\n${message}`);
    Util.writeLog({ type: 'panel.kick', message: `Banned by ${this.player.name}\n${message}` }, target);
  }
  
  /** @param {Player} target */
  async showTags(target) {
    const tags = target.getTags().sort((a, b) => a.localeCompare(b)).map(t => `- ${t}§r`);
    const form = new UI.ActionFormData();
    form.title(`${target.name}'s tags`)
      .body(tags.length > 0 ? `タグ一覧 (${tags.length} tags)\n\n${tags.join('\n')}` : 'このプレイヤーはタグを持っていません')
      .button('戻る / Return', Icons.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerInfo(target);
  }
  
  /** @param {Player} target */
  async showScores(target) {
    const objectives = world.scoreboard.getObjectives();
    /** @type {[ScoreboardObjective, number | undefined][]} */
    const entries = objectives.map(obj => [obj, Util.getScore(target, obj.id)]);
    entries.sort((a, b) => a[0].id.localeCompare(b[0].id));
    entries.sort((a, b) => (a[1] ?? 0) - (b[1] ?? 0));
    entries.sort((entry) => typeof entry[1] === 'number' ? -1 : 1);
    const messages = entries
      .map(([obj, score]) => `- ${obj.id}§r (${obj.displayName}§r) : ${score ?? 'null'}`);
    const form = new UI.ActionFormData();
    form.title(`${target.name}'s scores`)
      .body(messages.length > 0 ? `スコア一覧 (${objectives.length} objectives)\n\n${messages.join('\n')}` : 'このプレイヤーはスコアを持っていません')
      .button('戻る / Return', Icons.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerInfo(target);
  }
  
  async showEntities() {
    const count = {}
    const entities = world.getDimension('overworld').getEntities();
    for (const e of entities) {
      count[e.typeId] ??= 0;
      count[e.typeId]++
    }
    const messages = Object.entries(count)
      .sort((a,b) => b[1] - a[1])
      .map(([ type, n ]) => `- ${type} : ${coloredEntityCount(type, n)}`);
    const form = new UI.ActionFormData();
    form.title(`Entities`);
    form.body(messages.length > 0 ? `エンティティ一覧 (${entities.length} entities)\n\n${messages.join('\n')}` : 'ワールド内にエンティティが存在しません');
    form.button('戻る / Return', Icons.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.main();
  }
  
  async configPanel() {
    new ConfigPanel(this.ac, this.player, false);
  }
  
  async actionLogs() {
    const logs = (world.logs ?? []).slice().reverse();
    const form = new ActionForm();
    form.title('ActionLogs');
    form.body(logs.length ? `§o直近${logs.length}件のログを表示しています` : '§o何も記録されていないようです');
    logs.forEach((log, i) => form.button(`§0[${log.punishment?'§4':''}${log.type}§r§0] ${log.playerName ?? ''}§r\n§o§8${Util.getTime(log.createdAt)}§r`, null, i));
    form.button('§l§cログをクリア / Clear all logs', Icons.clear, 'clear');
    form.button('§l戻る / Return', Icons.returnBtn, 'return');
    
    const { canceled, button } = await form.show(this.player);
    if (canceled) return;
    if (button.id === 'clear') {
      world.logs = [];
      Util.notify('§a全てのログをクリアしました', this.player);
      return;
    }
    if (button.id === 'return') return await this.main();
    return await this.logDetail(logs[button.id]);
  }
  
  /** @arg {import('../types').ActionLog} log */
  async logDetail(log) {
    const body = [
      `[§l${log.punishment?'§c':''}${log.type}§r] §7- ${Util.getTime(log.createdAt)}§r`,
      log.playerName ? `§7プレイヤー名: §r${log.playerName}§r` : null,
      log.playerId ? `§7プレイヤーID: §r${log.playerId}` : null,
      log.punishment ? `§7警告タイプ: §r${log.punishment}§r` : null,
      log.message,
      '§r' // spacer
    ];
    const form = new ActionForm();
    form.title('ActionLog');
    form.body(body.filter(Boolean).join('\n'));
    form.button('§l戻る / Return', Icons.returnBtn, 'return');
    
    const { canceled, button } = await form.show(this.player);
    if (canceled) return;
    if (button.id === 'return') return await this.actionLogs();
  }

  async about() {
    const form = FORMS.about();
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.main();
  }
  
  static getPanelItem() {
    const item =  new ItemStack(ItemTypes.get(config.others.adminPanel), 1);
    item.nameTag = panelItem.nameTag;
    item.setLore([ Util.hideString(panelItem.lore) ]);
    return item;
  }
  
  /**
   * @arg {ItemStack} [item]
   * @returns {boolean}
   */
  static isPanelItem(item) {
    if (!item) return false;
    return (
      item.typeId === config.others.adminPanel &&
      item.nameTag === panelItem.nameTag &&
      item.getLore()[0] === Util.hideString(panelItem.lore)
    );
  }
}

/**
 * @arg {Player} player
 * @arg {boolean} [fromChat]
 */
export async function manageUnbanQueue(player, fromChat) {
  const queue = BanManager.getUnbanQueue();
  queue.sort((entry) => entry.source === 'property' ? -1 : 1); // property優先
  
  const form = new ActionForm();
  form.title('UnbanQueue Manager');
  form.body(
    queue.length > 0
      ? 'UnbanQueueから削除する人を選択してください\nSelect player to be removed from UnbanQueue\n '
      : '§o§cUnbanQueueに登録されているプレイヤーは居ません§r\n '
  );
  form.button('§lプレイヤーを追加 / Add player', Icons.plus, 'add');
  for (const index in queue) form.button(queue[index].name, null, index);
  
  const { canceled, button } = await (fromChat ? Util.showFormToBusy(player, form) : form.show(player));
  if (canceled) return;

  if (button.id === 'add') {
    const form = new UI.ModalFormData();
    form.title('UnbanQueue / Add player');
    form.textField('プレイヤー名 / Player Name', 'player');
    const { canceled, formValues } = await form.show(player);
    const targetName = /** @type {string} */ (formValues[0]);
    if (canceled || !targetName) return await manageUnbanQueue(player);
    BanManager.addUnbanQueue(targetName);
    Util.notify(`§7${player.name} >> §r${targetName}§r をunbanのリストに追加しました`);
    Util.writeLog({ type: 'unban.add', playerName: targetName, message: `Executed by ${player.name}` });
    
  } else {
    const entry = queue[button.id];
    if (!entry) return player.sendMessage('§cError: 操作に失敗しました');
    if (entry.source === 'file') return player.sendMessage('§cError: unban_queue.jsファイル内に書かれているプレイヤーのため削除できません');

    const res = await confirmForm(player, {
      body: `本当に §l§c${entry.name}§r をUnbanQueueから削除しますか？`
    });
    if (!res) return await manageUnbanQueue(player);
    BanManager.removeUnbanQueue(entry.name);
    Util.notify(`§7${player.name} >> §r${entry.name} §7(${entry.source})§r をUnbanQueueから削除しました`);
    Util.writeLog({ type: 'unban.remove', playerName: entry.name, message: `Executed by ${player.name}` });
  }
}

function coloredEntityCount(typeId, count) {
  const maxCount = config.entityCounter.detect[typeId] ?? config.entityCounter.defaultCount;
  const color = count > maxCount ? '§c' : (count > maxCount / 2 ? '§e' : '');
  return `${color}${count}§r`;
}

/**
 * @arg {Player} player
 * @returns {ItemInformation[]}
 */
function getAllSlots(player) {
  const { container } = player.getComponent('minecraft:inventory');
  const equipment = player.getComponent('minecraft:equippable');
  /** @type {ItemInformation[]} */
  const slots = [];
  for (let i = 0; i < container.size; i++) {
    slots.push({ slot: container.getSlot(i), slotId: i });
  }
  for (const slotId of Object.values(EquipmentSlot)) {
    if (slotId === EquipmentSlot.Mainhand) continue;
    slots.push({ slot: equipment.getEquipmentSlot(slotId), slotId });
  }
  return slots;
}