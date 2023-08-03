import { world } from '@minecraft/server';
import { Util } from '../util/util'
import { BaseManager } from './BaseManager';
import { CommandError } from '../util/CommandError';
import config from '../config.js';
import { COMMANDS } from '../commands/index';
import { PlayerCommandOrigin, ScriptEventCommandOrigin, ServerCommandOrigin } from '../util/CommandOrigin';

/** @typedef {import('../types').CommandData} CommandData */

export class CommandManager extends BaseManager {
  /** @param {import('../ac').TNAntiCheat} ac */
  constructor(ac) {
    super(ac);
    
    if (config.others.debug) console.warn('[CommandManager] initialized');

    /** @type {Map<string, CommandData>} */
    this.registeredCommands = new Map();
    
    this.load();
  }
  
  /** @type {string} */
  get prefix() {
    return config.command.prefix;
  }
  
  /**
   * @arg {import('../types').PlayerCommandInput} ev
   * @arg {boolean} [scriptEvent]
   */
  async handle(ev, scriptEvent) {
    const { message, sender } = ev;
    if (!this.isCommand(message) && !scriptEvent) return;
    
    const [ commandName, ...args ] = Util.splitNicely(
      scriptEvent ? message : message.slice(this.prefix.length)
    );
    const command = this.getCommand(commandName);
    if (!command) {
      if (!scriptEvent) { // コマンドが見つからなかったら非表示にだけして他のアドオンにも回す
        ev.sendToTargets = true;
        ev.setTargets([]);
      }
      return sender.sendMessage('[CommandManager] §cError: コマンドが見つかりませんでした');
    }
    
    await Util.cancel(ev); // コマンドがあったらキャンセル
    if (command.permission && !command.permission(sender)) return sender.sendMessage('[CommandManager] §cError: 権限がありません');
    if (scriptEvent && command.disableScriptEvent) return sender.sendMessage('このコマンドはScriptEventからの実行を許可されていません');
    
    try {
      const origin = scriptEvent ? new ScriptEventCommandOrigin(sender) : new PlayerCommandOrigin(sender);
      command.func(origin, args, this);
    } catch (e) {
      sender.sendMessage(`[CommandManager] §c${e}`);
      if (config.others.debug && e.stack && !(e instanceof CommandError)) sender.sendMessage(`§c${e.stack}`);
    }
  }
  
  /**
   * SourceTypeがServerの時動く
   * @arg {import('../types').ServerCommandInput} ev
   */
  async handleFromServer(ev) {
    const { message } = ev;
    if (!config.others.enableCommandFromConsole) return;
    
    const [ commandName, ...args ] = Util.splitNicely(message);
    const command = this.getCommand(commandName);
    if (!command) return console.error('[CommandManager] §cError: コマンドが見つかりませんでした');
    if (command.disableScriptEvent) return console.error('このコマンドはScriptEventからの実行を許可されていません');
    try {
      const origin = new ServerCommandOrigin();
      command.func(origin, args, this);
    } catch (e) {
      console.error(`[CommandManager] §c${e}`);
      if (config.others.debug && e.stack && !(e instanceof CommandError)) console.error(`§c${e.stack}`);
    }
  }
  
  /** @returns {CommandData[]} */
  getAll() {
    return [...this.registeredCommands.values()];
  }
  
  /** @param {string} message */
  isCommand(message) {
    return message.startsWith(this.prefix);
  }
  
  /**
   * @param {string} commandName
   * @returns {CommandData}
   */
  getCommand(commandName) {
    return this.registeredCommands.get(commandName) ?? this.getAll().find(c => c.aliases?.includes(commandName));
  }
  
  async load() {
    const showError = (msg) => {
      console.error(msg);
      world.sendMessage(msg);
    }
    
    const wait = COMMANDS.map(async name => {
      return import(`../commands/${name}`)
        .then(file => this.create(file.default))
        .catch(e => showError(`[CommandManager] §cError: failed to load command: ${name}\n${e}\n${e.stack}`));
    });
    
    const data = await Promise.all(wait);
    if (config.others.debug)
      console.warn(`[CommandManager] Registered ${data.filter(Boolean).length}/${COMMANDS.length} commands`);
  }
  
  /** @param {import('../util/Command').Command} command */
  create(command) {
    this.registeredCommands.set(command.data.name, command.data);
    return command;
  }
}
