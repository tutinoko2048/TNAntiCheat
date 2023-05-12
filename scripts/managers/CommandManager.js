import { world, system } from '@minecraft/server';
import { Util } from '../util/util'
import { BaseManager } from './BaseManager';
import { CommandError } from '../util/CommandError';
import config from '../config.js';
import { COMMANDS } from '../commands/index';

export class CommandManager extends BaseManager {
  constructor(ac) {
    super(ac);
    
    if (config.others.debug) console.warn('[CommandManager] initialized');

    /** @type {Map<string, import('../types/index').ICommand>} */
    this.registeredCommands = new Map();
    
    this.load();
  }
  
  get prefix() {
    return config.command.prefix;
  }
  
  /**
   * @param {import('../types/index').CommandInput} ev 
   * @param {boolean} [scriptEvent]
   */
  handle(ev, scriptEvent) {
    const { message, sender } = ev;
    if (!this.isCommand(message) && !scriptEvent) return;
    ev.cancel = true;

    const [ commandName, ...args ] = Util.splitNicely(
      scriptEvent ? message : message.slice(this.prefix.length)
    );
    const command = this.getCommand(commandName);
    if (!command) return sender.sendMessage('[CommandManager] §cError: コマンドが見つかりませんでした');
    if (command.permission && !command.permission(sender)) return sender.sendMessage('[CommandManager] §cError: 権限がありません');
    if (scriptEvent && command.disableScriptEvent) return sender.sendMessage('このコマンドはScriptEventからの実行を許可されていません');
    
    system.run(() => {
      try {
        command.func(sender, args, this);
      } catch (e) {
        sender.sendMessage(`[CommandManager] §c${e}`);
        if (config.others.debug && e.stack && !(e instanceof CommandError)) sender.sendMessage(`§c${e.stack}`);
      }
    });
  }
  
  getAll() {
    return [...this.registeredCommands.values()];
  }
  
  isCommand(message) {
    return message.startsWith(this.prefix);
  }
  
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
