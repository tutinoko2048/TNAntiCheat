import { world } from '@minecraft/server';
import { Util } from '../util/util'
import { BaseManager } from './BaseManager';
import { CommandError } from '../util/CommandError';
import config from '../config.js';
import { COMMANDS } from '../commands/index';

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
   * @arg {import('../types').CommandInput} ev
   * @arg {boolean} [scriptEvent]
   */
  async handle(ev, scriptEvent) {
    const { message, sender } = ev;
    if (!this.isCommand(message) && !scriptEvent) return;
    await Util.cancel(ev);

    const [ commandName, ...args ] = Util.splitNicely(
      scriptEvent ? message : message.slice(this.prefix.length)
    );
    const command = this.getCommand(commandName);
    if (!command) return sender.sendMessage('[CommandManager] §cError: コマンドが見つかりませんでした');
    if (command.permission && !command.permission(sender)) return sender.sendMessage('[CommandManager] §cError: 権限がありません');
    if (scriptEvent && command.disableScriptEvent) return sender.sendMessage('このコマンドはScriptEventからの実行を許可されていません');
    
    try {
      command.func(sender, args, this);
    } catch (e) {
      sender.sendMessage(`[CommandManager] §c${e}`);
      if (config.others.debug && e.stack && !(e instanceof CommandError)) sender.sendMessage(`§c${e.stack}`);
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
