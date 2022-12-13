import { world, system, MinecraftItemTypes, MinecraftDimensionTypes, ItemStack, GameMode, ItemTypes } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { Util } from '../util/util';
import config from '../config.js';
import { properties, ICONS, panelItem } from '../util/constants';
import chatFilter from '../chat_filter.js';
import { description } from '../util/config_description';
import { FORMS, DROPDOWNS } from './static_form';
import { Permissions } from '../util/Permissions';

const defaultConfig = Util.cloneObject(config);
const defaultFilter = Util.cloneObject(chatFilter);

export class AdminPanel {
  constructor(ac, player) {
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
    if (selection === 2) return await this.selectModule();
    if (selection === 3) return await this.chatFilter();
    if (selection === 4) return await this.about();
  }
  
  async playerList() {
    const viewPermission = (p) => Util.isOP(p) ? '§2[OP]' : Permissions.has(p, 'builder') ? '[Builder]' : null;
    const players = world.getAllPlayers();
    const form = new UI.ActionFormData();
    for (const p of players) form.button(viewPermission(p) ? `${viewPermission(p)}§8 ${p.name}` : p.name);
    form.body(`§7Players: §f${players.length}`)
      .title('プレイヤーリスト / Player List')
      .button('戻る / Return', ICONS.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === players.length) return await this.main(); // return button
    return await this.playerInfo(players[selection]);
  }
  
  async playerInfo(player) {
    const { x, y, z } = Util.vectorNicely(player.location);
    const { current, value } = player.getComponent('minecraft:health');
    const info = [
      `§7Name: §f${player.name}`,
      `§7Dimension: §f${player.dimension.id}`,
      `§7Location: §f${x}, ${y}, ${z}`,
      `§7Health: §f${Math.floor(current)} / ${value}`,
      `§7Gamemode: §f${Util.getGamemode(player)}`,
      `§7ID: §f${player.id}`
    ].join('\n');
    const form = FORMS.playerInfo.body(`${info}\n `);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.showInventory(player);
    if (selection === 1) return await this.toggleMute(player);
    if (selection === 2) return await this.kickPlayer(player);
    if (selection === 3) return await this.banPlayer(player);
    if (selection === 4) {
      this.player.teleport(player.location, player.dimension, player.rotation.x, player.rotation.y);
      Util.notify(`${player.name} §rにテレポートしました §7[${x}, ${y}, ${z}]§r`, this.player);
    }
    if (selection === 5) {
      player.teleport(this.player.location, this.player.dimension, this.player.rotation.x, this.player.rotation.y);
      Util.notify(`${player.name} §rをテレポートさせました`, this.player);
    }
    if (selection === 6) return await this.showTags(player);
    if (selection === 7) return await this.showScores(player);
    if (selection === 8) return await this.playerList();
  }
  
  async showInventory(player) {
    const container = player.getComponent('minecraft:inventory').container;
    const items = Array(container.size).fill(null).map((_,i) => {
      const item = container.getItem(i);
      if (item) item._slot = i;
      return item;
    }).filter(Boolean);
    
    const form = new UI.ActionFormData();
    form.button('§l§1更新 / Reload', ICONS.reload);
    if (items.length === 0) form.body('何も持っていないようです\n ');
    items.forEach(item => form.button(`§r${item.typeId}:${item.data}\n§7slot: ${item._slot}, amount: ${item.amount}`));
    form.title(`${player.name}'s inventory`)
      .button('§l§c全て削除 / Clear all', ICONS.clear)
      .button('§l§cエンダーチェストをクリア / Clear enderchest', ICONS.enderchest)
      .button('戻る / Return', ICONS.returnBtn);
    
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    
    if (selection === 0) {
      return this.showInventory(player);
    
    } else if (selection === items.length + 1) {
      const res = await this.confirmForm('確認', `§l§c${player.name}§r の全てのアイテムを削除しますか？`, '§lはい / YES', '§lいいえ / NO');
      if (res) {
        await player.runCommandAsync('clear @s');
        Util.notify(`${player.name} の全てのアイテムを削除しました`, this.player);
      } else return await this.showInventory(player);
      
    } else if (selection === items.length + 2) {
      const res = await this.confirmForm('確認', `§l§c${player.name}§r のエンダーチェストの全てのアイテムを削除しますか？`, '§lはい / YES', '§lいいえ / NO');
      if (res) {
        await player.runCommandAsync('function util/clear_ec');
        Util.notify(`${player.name} のエンダーチェストの全てのアイテムを削除しました`, this.player);
      } else return await this.showInventory(player);
      
    } else if (selection === items.length + 3) {
      return await this.playerInfo(player);
      
    } else {
      return await this.itemInfo(player, items[selection - 1]);
    }
  }
  
  async itemInfo(player, item) {
    const form = FORMS.itemInfo.body(`§7owner: §r${player.name}\n§7item: §r${item.typeId}:${item.data}\n§7slot: §r${item._slot}\n§7amount: §r${item.amount}\n§7nameTag: §r${item.nameTag ?? '-'}\n `);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) {
      player.getComponent('minecraft:inventory').container.clearItem(item._slot);
      Util.notify(`${player.name} の ${item.typeId}:${item.data} §7(slot:${item._slot})§r を削除しました`, this.player);
    }
    if (selection === 1) {
      this.player.getComponent('minecraft:inventory').container.addItem(item);
      Util.notify(`${player.name} の ${item.typeId}:${item.data} §7(slot:${item._slot})§r を複製しました`, this.player);
    }
    if (selection === 2) {
      this.player.getComponent('minecraft:inventory').container.addItem(item);
      player.getComponent('minecraft:inventory').container.clearItem(item._slot);
      Util.notify(`${player.name} の ${item.typeId}:${item.data} §7(slot:${item._slot})§r を移動しました`, this.player);
    }
    if (selection === 3) return await this.showInventory(player);
  }
  
  async toggleMute(player) {
    const _mute = player.getDynamicProperty(properties.mute) ?? false;
    const form = new UI.ModalFormData();
    form.title('Mute')
      .toggle('ミュート / Mute', _mute);
    const { formValues, canceled } = await form.show(this.player);
    if (canceled) return;
    const [ mute ] = formValues;
    if (mute != _mute) {
      player.runCommandAsync(`ability @s mute ${mute}`).then(() => {
        player.setDynamicProperty(properties.mute, mute);
        Util.notify(`§a${player.name} のミュートを ${mute} に設定しました`, this.player);
      }).catch(() => {
        Util.notify(`§c${player.name} のミュートに失敗しました (Education Editionがオフになっている可能性があります)`, this.player);
      });
    } else return await this.playerInfo(player);
  }
  
  async kickPlayer(player) {
    const res = await this.confirmForm('確認', `§l§c${player.name} §rを本当にkickしますか？`, '§lはい / YES', '§lいいえ / NO');
    if (res) {
      if (player.name === this.player.name) return Util.notify('§cError: 自分をkickすることはできません', this.player);
      Util.kick(player);
      Util.notify(`${this.player.name} >> プレイヤー §c${player.name}§r をkickしました`);
    } else return await this.playerInfo(player);
  }
  
  async banPlayer(player) {
    const res = await this.confirmForm('確認', `§l§c${player.name} §rを本当にbanしますか？`, '§lはい / YES', '§lいいえ / NO');
    if (res) {
      if (player.name === this.player.name) return Util.notify('§cError: 自分をbanすることはできません', this.player);
      Util.ban(player);
      Util.notify(`${this.player.name} >> プレイヤー §c${player.name}§r をbanしました`);
    } else return await this.playerInfo(player);
  }
  
  async showTags(player) {
    const tags = player.getTags().map(t => `- ${t}`);
    const form = new UI.ActionFormData();
    form.title(`${player.name}'s tags`)
      .body(tags.length > 0 ? `タグ一覧:\n\n${tags.join('\n')}` : 'このプレイヤーはタグを持っていません')
      .button('戻る / Return', ICONS.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerInfo(player);
  }
  
  async showScores(player) {
    const getScore = (obj, p) => {
      try { 
        return obj.getScore(p.scoreboard);
      } catch { return null }
    }
    const messages = world.scoreboard
      .getObjectives()
      .map(obj => `- ${obj.id} (${obj.displayName}) : ${Util.getScore(player, obj.id) ?? 'null'}`);
    const form = new UI.ActionFormData();
    form.title(`${player.name}'s scores`)
      .body(messages.length > 0 ? `スコア一覧:\n\n${messages.join('\n')}` : 'このプレイヤーはスコアを持っていません')
      .button('戻る / Return', ICONS.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.playerInfo(player);
  }
  
  async showEntities() {
    const count = {}
    for (const e of world.getDimension('overworld').getEntities()) {
      count[e.typeId] ??= 0;
      count[e.typeId]++
    }
    const messages = Object.entries(count)
      .sort((a,b) => b[1] - a[1])
      .map(([ type, n ]) => `- ${type} : ${n}`);
    const form = new UI.ActionFormData();
    form.title(`Entities`)
      .body(messages.length > 0 ? `エンティティ一覧:\n\n${messages.join('\n')}` : 'ワールド内にエンティティが存在しません')
      .button('戻る / Return', ICONS.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.main();
  }

  async selectModule() {
    const form = new UI.ActionFormData();
    const keys = Object.keys(config);
    for (const k of keys) {
      const color = config[k].state ? '§2' : (config[k].state === false ? '§c' : '');
      const desc = description[k]?.desc ? `\n§7${description[k].desc}§r` : '';
      form.button(`${color}§l${k}§r${desc}`);
    }
    form.title('Config Selector')
      .body('編集したいConfigを選択してください')
      .button('§l§c初期設定に戻す')
      .button('直接編集する / Raw Editor')
      .button('戻る / Return', ICONS.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === keys.length) {
      const res = await this.confirmForm('確認', `全てのConfigを初期設定に戻しますか？`, '§lはい / YES', '§lいいえ / NO');
      if (res) {
        for (const k of keys) config[k] = resetModule(k);
        world.setDynamicProperty(properties.configData, '{}');
        Util.notify(`§aConfigをリセットしました`);
      } else return await this.selectModule();
      return;
    }
    if (selection === keys.length + 1) return await this.rawEditor();
    if (selection === keys.length + 2) return await this.main(); // return button
    const moduleName = keys[selection];
    const data = await this.selectKey(moduleName);
    if (isChanged(data, config[moduleName])) {
      changeConfig(data, moduleName);
      Util.notify('§aConfigを保存しました', this.player);
    }
  }
  
  async selectKey(moduleName, data, showReset = true) { // module object
    data ??= Util.cloneObject(config[moduleName]);
    const form = new UI.ActionFormData();
    form.title('Key Selector')
      .body(`§l§6Module: ${moduleName}§r\n${descriptionBuilder(moduleName) ?? ' '}\n `);
    const keys = Object.keys(data);
    for (const k of keys) form.button(`${k}\n§7${getPreview(data[k])}`);
    if (showReset) form.button('§l§c初期設定に戻す / Reset settings', ICONS.reset)
    form.button('戻る / Return', ICONS.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return data;
    if (showReset && selection === keys.length) {
      Util.notify(`${moduleName} を初期設定に戻しました`, this.player);
      return resetModule(moduleName);
    }
    const backIndex = showReset ? keys.length + 1 : keys.length; // true: reset button exists
    if (selection === backIndex) {
      (moduleName === 'ChatFilter') ? this.chatFilter() : this.selectModule();
      return data;
    }
    const key = keys[selection];
    if (Array.isArray(data[key])) {
      data[key] = await this.selectArray(data[key], key, moduleName);
    } else if (typeof data[key] == 'object') {
      data[key] = await this.selectKey(moduleName, data[key], false);
    } else {
      data[key] = await this.editValue(data[key], key);
    }
    return data;
  }
  
  async selectArray(array, key) {
    const form = new UI.ActionFormData();
    form.title('Array Selector');
    for (const value of array) form.button(String(value));
    form.button('§l§2値を追加する / Add value', ICONS.plus)
      .button('戻る / Return', ICONS.returnBtn);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return array;
    if (selection === array.length + 1) {
      (key === 'filter') ? this.chatFilter() : this.selectModule();
      return array;
    }
    const edited = await this.editValue(array[selection], key, true);
    if (array[selection]) array[selection] = edited;
      else array.push(edited);
    return array.filter(Boolean); // returns array without null
  }
  
  async editValue(value, key, deletable = false) { // string | number | boolean
    const form = new UI.ModalFormData();
    form.title('Config Editor');
    const useDropdown = Object.keys(DROPDOWNS).includes(key);
    switch (typeof value) {
      case 'string':
        if (useDropdown) form.dropdown(
          key,
          DROPDOWNS[key].map(x => `${x.value} §l§7${x.desc ?? ''}`),
          DROPDOWNS[key].findIndex(x => x.value === value)
        )
        else form.textField(key, '<String>', value);
        break;
      case 'number':
        form.textField(key, '<Number>', String(value));
        break;
      case 'boolean':
        form.toggle(key, value);
        break;
      case 'undefined':
        form.textField(key, '<String>');
        break;
    }
    if (deletable) form.toggle('§l§cこの値を削除する', false);
    const { formValues, canceled } = await form.show(this.player);
    if (canceled) return value;
    if (formValues[1]) return null;
    const edited = (typeof value == 'number') ? toNumber(formValues[0]) : formValues[0];
    if (edited === null) {
      Util.notify(`§cError: ${formValues[0]} は無効な値です。数字を入力してください`, this.player);
      return value; // not change value if not a number
    }
    return useDropdown ? DROPDOWNS[key][edited].value : edited;
  }
  
  async rawEditor() {
    const form = new UI.ModalFormData();
    form.title('Raw Editor')
      .textField('config (コピーして別のところで編集してください)', 'Put json here', JSON.stringify(config));
    const { canceled, formValues } = await form.show(this.player);
    if (canceled) return;
    let data;
    try {
      data = JSON.parse(formValues[0]);
    } catch {
      return Util.notify('§c[Error] JSONのパースに失敗しました');
    }
    const changed = [];
    for (const moduleName of Object.keys(data)) {
      if (!config[moduleName] || !isChanged(config[moduleName], data[moduleName])) continue;
      changeConfig(data[moduleName], moduleName);
      changed.push(moduleName);
    }
    if (changed.length > 0) Util.notify(`§aConfigを保存しました§r\n${changed.map(x => `- ${x}`).join('\n')}`, this.player);
  }
  
  async chatFilter() {
    const form = FORMS.chatFilter;
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) {
      const res = await this.selectKey('ChatFilter', Util.cloneObject(chatFilter), true);
      if (isChanged(res, chatFilter)) this.changeFilter(res);
    }
    if (selection === 1) return await this.main();
  }
  
  // returns yes -> true, no -> false
  async confirmForm(title, body, yes, no, cancelValue = false) {
    const form = new UI.MessageFormData();
    form.title(title)
      .body(body)
      .button1(yes)
      .button2(no);
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return cancelValue;
    return selection === 1;
  }
  
  changeFilter(data) {
    try {
      world.setDynamicProperty(properties.chatFilter, JSON.stringify(data));
      let stateChanged = false;
      for (const [k,v] of Object.entries(data)) {
        if (k == 'state' && chatFilter.state != v) stateChanged = true;
        chatFilter[k] = v;
      }
      Util.notify(`§aChatFilterを${stateChanged ? `${data.state}に設定しました` : '変更しました'}`, this.player);
    } catch(e) {
      Util.notify(`§cError: ChatFilterの保存に失敗しました\n${e}`, this.player);
    }
  }
  
  async about() {
    const form = FORMS.about;
    const { selection, canceled } = await form.show(this.player);
    if (canceled) return;
    if (selection === 0) return await this.main();
  }
  
  static getPanelItem() {
    const item =  new ItemStack(ItemTypes.get(config.others.adminPanel), 1, 0);
    item.nameTag = panelItem.nameTag;
    item.setLore([ Util.hideString(panelItem.lore) ]);
    return item;
  }
  
  static isPanelItem(item) {
    if (!item) return false;
    return item.typeId === config.others.adminPanel && item.nameTag === panelItem.nameTag && item.getLore()[0] === Util.hideString(panelItem.lore);
  }
}

function resetModule(moduleName) {
  if (moduleName === 'ChatFilter') return Util.cloneObject(defaultFilter);
  return Util.cloneObject(defaultConfig[moduleName]);
}

function changeConfig(data, moduleName) {
  if (moduleName === 'itemList') {
    for (const type in data) {
      if (!isChanged(config.itemList[type], data[type])) continue;
      config.itemList[type] = data[type]; // change config
      saveConfig(data, moduleName, type);
    }
  } else {
    config[moduleName] = data;
    saveConfig(data, moduleName);
  }
}

function saveConfig(data, moduleName, type) {
  const _config = JSON.parse(world.getDynamicProperty(properties.configData) ?? '{}');
  if (type) {
    if (!_config[moduleName]) _config[moduleName] = {}
    _config[moduleName][type] = data[type];
    
  } else {
    _config[moduleName] = data;
  }
  world.setDynamicProperty(properties.configData, JSON.stringify(_config));
}

function isChanged(data1, data2) { // compare objects
  return JSON.stringify(data1) !== JSON.stringify(data2);
}

function getPreview(value) {
  return ['string', 'number', 'boolean'].includes(typeof value) ? value : `[${typeof value}]`
}

function toNumber(value) {
  return isNaN(Number(value)) ? null : Number(value);
}

function descriptionBuilder(moduleName) {
  if (!description[moduleName]) return;
  const _module = description[moduleName]
  return Object.keys(description[moduleName])
    .map(k => k == 'desc' ? _module[k] : `- ${k}: ${_module[k]}`)
    .join('\n');
}