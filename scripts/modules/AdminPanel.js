import { world, ItemStack, ItemTypes, EquipmentSlot, Player } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { Util } from '../util/util';
import config from '../config.js';
import { PropertyIds, Icons, panelItem } from '../util/constants';
import { FORMS, confirmForm } from './static_form';
import { Permissions } from '../util/Permissions';
import { ConfigPanel } from './ConfigPanel';
import { ActionForm } from '../lib/form/index';

/** @typedef {{ item: ItemStack, slot: EquipmentSlot | number }} ItemInformation */

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
    const players = world.getAllPlayers();
    const info = [
      `§l§7現在時刻: §r${Util.getTime()}`,
      `§l§7ワールド経過時間: §r${Util.parseMS(Date.now() - this.ac.startTime)}`,
      `§l§7プレイヤー数: §r${players.length}`,
      `§l§7TPS: §r${this.ac.getTPS().toFixed(1)}`
    ].join('\n');
    const form = FORMS.main.body(`TN-AntiCheatの管理者用パネルです\n\n§l§b--- World Info ---§r\n${info}\n `);
    const { selection, canceled } = busy
      ? await Util.showFormToBusy(this.player, form)
      : await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerList();
    if (selection === 1) return await this.showEntities();
    if (selection === 2) return await this.configPanel();
    if (selection === 3) return await this.actionLogs();
    if (selection === 4) return await this.about();
  }
  
  async playerList() {
    const viewPermission = (p) => Util.isOP(p) ? '§2[OP]' : Permissions.has(p, 'builder') ? '§6[Builder]' : null;
    const icon = (p) => Util.isOP(p) ? Icons.op : Permissions.has(p, 'builder') ? Icons.builder : Icons.member;
    // @ts-ignore
    const players = world.getAllPlayers().sort((a,b) => a.name - b.name);
    const form = new UI.ActionFormData();
    for (const p of players) form.button(
      viewPermission(p) ? `${viewPermission(p)}§8 ${p.name}` : p.name,
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
  
  /** @param {Player} player */
  async playerInfo(player) {
    const { x, y, z } = Util.vectorNicely(player.location);
    const { currentValue, effectiveMax } = player.getComponent('minecraft:health');
    const viewPermission = (p) => Util.isOP(p) ? '§aop§f' : Permissions.has(p, 'builder') ? '§ebuilder§f' : 'member';
    const info = [
      `§7Name: §f${player.name}`,
      `§7Dimension: §f${player.dimension.id}`,
      `§7Location: §f${x}, ${y}, ${z}`,
      `§7Health: §f${Math.floor(currentValue)} / ${effectiveMax}`,
      `§7Gamemode: §f${Util.getGamemode(player)}`,
      `§7ID: §f${player.id}`,
      `§7Permission: §f${viewPermission(player)}`,
      player.joinedAt ? `§7JoinedAt: §f${Util.getTime(player.joinedAt)}` : null
    ].filter(Boolean).join('\n');
    const form = FORMS.playerInfo.body(`${info}\n `);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.showInventory(player);
    if (selection === 1) return await this.managePermission(player);
    if (selection === 2) return await this.toggleMute(player);
    if (selection === 3) return await this.kickPlayer(player);
    if (selection === 4) return await this.banPlayer(player);
    if (selection === 5) {
      this.player.teleport(player.location, { dimension: player.dimension, rotation: player.getRotation() });
      Util.notify(`${player.name} §rにテレポートしました §7[${x}, ${y}, ${z}]§r`, this.player);
    }
    if (selection === 6) {
      player.teleport(this.player.location, { dimension: this.player.dimension, rotation: this.player.getRotation() });
      Util.notify(`${player.name} §rをテレポートさせました`, this.player);
    }
    if (selection === 7) return await this.showTags(player);
    if (selection === 8) return await this.showScores(player);
    if (selection === 9) return await this.playerList();
  }
  
  /** @param {Player} player */
  async showInventory(player) {
    const itemList = [...getAllItems(player), ...getAllEquipments(player)].filter(info => !!info.item);
   
    const form = new UI.ActionFormData();
    form.button('§l§1更新 / Reload', Icons.reload);
    if (itemList.length === 0) form.body('何も持っていないようです\n ');
    itemList.forEach(info => form.button(`§0${info.item.typeId}${typeof info.slot === 'string' ? ' ':''}\n§8slot: ${info.slot}, amount: ${info.item.amount}`));
    form.title(`${player.name}'s inventory`)
      .button('§l§c全て削除 / Clear all', Icons.clear)
      .button('§l§cエンダーチェストをクリア / Clear enderchest', Icons.enderchest)
      .button('戻る / Return', Icons.returnBtn);
    
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    
    if (selection === 0) {
      return this.showInventory(player);
    
    } else if (selection === itemList.length + 1) {
      const res = await confirmForm(this.player, {
        body: `§l§c${player.name}§r の全てのアイテムを削除しますか？`,
        yes: '§c削除する',
        no: '§lキャンセル'
      });
      if (res) {
        player.runCommand('clear @s');
        Util.notify(`${player.name} の全てのアイテムを削除しました`, this.player);
      } else return await this.showInventory(player);
      
    } else if (selection === itemList.length + 2) {
      const res = await confirmForm(this.player, {
        body: `§l§c${player.name}§r のエンダーチェストの全てのアイテムを削除しますか？`,
        yes: '§c削除する',
        no: '§lキャンセル'
      });
      if (res) {
        player.runCommand('function util/clear_ec');
        Util.notify(`${player.name} のエンダーチェストの全てのアイテムを削除しました`, this.player);
      } else return await this.showInventory(player);
      
    } else if (selection === itemList.length + 3) {
      return await this.playerInfo(player);
      
    } else {
      return await this.itemInfo(player, itemList[selection - 1]);
    }
  }
  
  /**
   * @param {Player} player 
   * @param {ItemInformation} info 
   */
  async itemInfo(player, info) {
    const form = FORMS.itemInfo.body(`§7owner: §r${player.name}\n§7item: §r${info.item.typeId}\n§7slot: §r${info.slot}\n§7amount: §r${info.item.amount}\n§7nameTag: §r${info.item.nameTag ?? '-'}\n `);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    
    const targetContainer = player.getComponent('minecraft:inventory').container;
    const targetEquipments = player.getComponent('minecraft:equipment_inventory');
    const myContainer = this.player.getComponent('minecraft:inventory').container;
    if (selection === 0) {
      typeof info.slot === 'string'
        ? targetEquipments.setEquipment(info.slot)
        : targetContainer.setItem(info.slot);
      Util.notify(`${player.name} の ${info.item.typeId} §7(slot: ${info.slot})§r を削除しました`, this.player);
    }
    if (selection === 1) {
      myContainer.addItem(info.item);
      Util.notify(`${player.name} の ${info.item.typeId} §7(slot: ${info.slot})§r を複製しました`, this.player);
    }
    if (selection === 2) {
      myContainer.addItem(info.item);
      typeof info.slot === 'string'
        ? targetEquipments.setEquipment(info.slot)
        : targetContainer.setItem(info.slot);
      Util.notify(`${player.name} の ${info.item.typeId} §7(slot: ${info.slot})§r を移動しました`, this.player);
    }
    if (selection === 3) return await this.showInventory(player);
  }
  
  /** @param {Player} player */
  async managePermission(player) {
    const _builder = Permissions.has(player, 'builder');
    const _admin = Permissions.has(player, 'admin');
    const form = new UI.ModalFormData();
    form.title('Manage Permissions')
      .toggle('§l§eBuilder§r - クリエイティブを許可します', _builder)
      .toggle('§l§aAdmin (OP)§r - アンチチートの管理権限です', _admin);
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return;
    const [ builder, admin ] = /** @type {boolean[]} */ (formValues);
    if (builder != _builder) {
      Permissions.set(player, 'builder', builder);
      Util.notify(`§7${this.player.name} >> §e${player.name} の permission:builder を ${builder ? '§a':'§c'}${builder}§e に設定しました`);
      Util.writeLog({ type: 'panel.permission', message: `§epermission:builder を §f${builder} §eに設定しました§r\nExecuted by ${this.player.name}` }, player);
    }
    if (admin != _admin) {
      Permissions.set(player, 'admin', admin);
      Util.notify(`§7${this.player.name} >> §e${player.name} の permission:admin を ${admin ? '§a':'§c'}${admin}§e に設定しました`);
      Util.writeLog({ type: 'panel.permission', message: `§epermission:admin を §f${admin} §eに設定しました§r\nExecuted by ${this.player.name}` }, player);
    }
  }
  
  /** @param {Player} player */
  async toggleMute(player) {
    const _mute = player.getDynamicProperty(PropertyIds.mute) ?? false;
    const form = new UI.ModalFormData();
    form.title('Mute')
      .toggle('ミュート / Mute', _mute);
    const { formValues, canceled } = await form.show(this.player);
    if (canceled) return;
    const [ mute ] = formValues;
    if (mute != _mute) {
      const res = Util.runCommandSafe(`ability @s mute ${mute}`, player);
      if (!res) return Util.notify(`§c${player.name} のミュートに失敗しました (Education Editionがオフになっている可能性があります)`, this.player);
      player.setDynamicProperty(PropertyIds.mute, mute);
      Util.notify(`§7${this.player.name} >> §a${player.name} のミュートを ${mute} に設定しました`, this.player);
      
    } else return await this.playerInfo(player);
  }
  
  /** @param {Player} player */
  async kickPlayer(player) {
    const res = await confirmForm(this.player, {
      body: `§l§c${player.name} §rを本当にkickしますか？`,
      yes: '§ckickする',
      no: '§lキャンセル'
    });
    if (res) {
      if (player.name === this.player.name) return Util.notify('§cError: 自分をkickすることはできません', this.player);
      Util.kick(player, '-');
      Util.notify(`§7${this.player.name} >> §fプレイヤー §c${player.name}§r をkickしました`);
      Util.writeLog({ type: 'panel.kick', message: `Kicked by ${this.player.name}` }, player);
    } else return await this.playerInfo(player);
  }
  
  /** @param {Player} player */
  async banPlayer(player) {
    const res = await confirmForm(this.player, {
      body: `§l§c${player.name} §rを本当にbanしますか？`,
      yes: '§cbanする',
      no: '§lキャンセル'
    });
    if (res) {
      if (player.name === this.player.name) return Util.notify('§cError: 自分をbanすることはできません', this.player);
      Util.ban(player, '-', '(from AdminPanel)');
      Util.notify(`§7${this.player.name} >> §fプレイヤー §c${player.name}§r をbanしました`);
      Util.writeLog({ type: 'panel.ban', message: `Banned by ${this.player.name}` }, player);
    } else return await this.playerInfo(player);
  }
  
  /** @param {Player} player */
  async showTags(player) {
    const tags = player.getTags().map(t => `- ${t}§r`);
    const form = new UI.ActionFormData();
    form.title(`${player.name}'s tags`)
      .body(tags.length > 0 ? `タグ一覧 (${tags.length} tags)\n\n${tags.join('\n')}` : 'このプレイヤーはタグを持っていません')
      .button('戻る / Return', Icons.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerInfo(player);
  }
  
  /** @param {Player} player */
  async showScores(player) {
    const objectives = world.scoreboard.getObjectives();
    objectives.sort((obj0, obj1) => {
      return Util.getScore(player, obj1.id) - Util.getScore(player, obj0.id);
    });
    const messages = objectives
      .map(obj => `- ${obj.id}§r (${obj.displayName}§r) : ${Util.getScore(player, obj.id) ?? 'null'}`);
    const form = new UI.ActionFormData();
    form.title(`${player.name}'s scores`)
      .body(messages.length > 0 ? `スコア一覧 (${objectives.length} objectives)\n\n${messages.join('\n')}` : 'このプレイヤーはスコアを持っていません')
      .button('戻る / Return', Icons.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerInfo(player);
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
    const form = FORMS.about;
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
  
  /** @arg {ItemStack} item  @returns {boolean} */
  static isPanelItem(item) {
    if (!item) return false;
    return (
      item.typeId === config.others.adminPanel &&
      item.nameTag === panelItem.nameTag &&
      item.getLore()[0] === Util.hideString(panelItem.lore)
    );
  }
}

function coloredEntityCount(typeId, count) {
  const maxCount = config.entityCounter.detect[typeId] ?? config.entityCounter.defaultCount;
  const color = count > maxCount ? '§c' : (count > maxCount / 2 ? '§e' : '');
  return `${color}${count}§r`;
}

/** @arg {Player} player  @returns {ItemInformation[]} */
function getAllEquipments(player) {
  const equipments = player.getComponent('minecraft:equipment_inventory');
  return Object.values(EquipmentSlot)
    .filter(slotId => slotId !== EquipmentSlot.mainhand)
    .map(slotId => ({
      item: equipments.getEquipment(slotId),
      slot: slotId
    }));
}

/** @arg {Player} player  @returns {ItemInformation[]} */
function getAllItems(player) {
  const { container } = player.getComponent('minecraft:inventory');
  return Array(container.size).fill(null).map((_,i) => ({
    item: container.getItem(i),
    slot: i
  }));
}