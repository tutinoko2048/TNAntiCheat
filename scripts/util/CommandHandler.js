import { Util } from './util'
import { CommandError } from './CommandError';
import config from '../config.js';

export class CommandHandler {
  constructor(ac) {
    this.ac = ac;
    console.warn('[CommandHandler] initialized');
    this.registeredCommands = new Map();
  }
  
  get prefix() {
    return config.command.prefix;
  }
  
  getCommand(commandName) {
    return this.registeredCommands.get(commandName) ?? this.getAll().find(c => c.aliases.includes(commandName));
  }
  
  handle(ev) {
    const { message, sender } = ev;
    if (!this.isCommand(message)) return;
    ev.cancel = true;
    
    const [ commandName, ...args ] = Util.splitNicely(message.slice(this.prefix.length));
    const command = this.getCommand(commandName);
    if (!command) return sender.tell('[CommandHandler] §cError: コマンドが見つかりませんでした');
    if (command.permission && !command.permission(sender)) return sender.tell('[CommandHandler] §cError: 権限がありません');
    
    try {
      command.func(sender, args, this);
    } catch(e) {
      sender.tell(`[CommandHandler] §c[Error] ${e}`);
      if (config.others.debug && e.stack && !(e instanceof CommandError)) sender.tell(`§c${e.stack}`);
    }
    
  }
  
  getAll() {
    return [...this.registeredCommands.values()];
  }
  
  isCommand(message) {
    return message.startsWith(this.prefix);
  }
  
  create(command) {
    this.registeredCommands.set(command.name, command);
    if (config.others.debug) console.warn(`[CommandHandler] Registered command: ${command.name}`);
  }
}