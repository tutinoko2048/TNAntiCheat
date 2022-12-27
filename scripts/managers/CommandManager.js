import { world } from '@minecraft/server';
import { Util } from '../util/util'
import { BaseManager } from './BaseManager';
import { CommandError } from '../util/CommandError';
import config from '../config.js';
import { COMMANDS } from '../commands/index';

export class CommandManager extends BaseManager {
  constructor(ac) {
    super(ac);
    
    if (config.others.debug) console.warn('[CommandManager] initialized');
    this.registeredCommands = new Map();
    
    this.load();
  }
  
  get prefix() {
    return config.command.prefix;
  }
  
  handle(ev) {
    const { message, sender } = ev;
    if (!this.isCommand(message)) return;
    ev.cancel = true;

    const [ commandName, ...args ] = Util.splitNicely(message.slice(this.prefix.length));
    const command = this.getCommand(commandName);
    if (!command) return sender.tell('[CommandManager] §cError: コマンドが見つかりませんでした');
    if (command.permission && !command.permission(sender)) return sender.tell('[CommandManager] §cError: 権限がありません');
    
    try {
      command.func(sender, args, this);
    } catch(e) {
      sender.tell(`[CommandManager] §c${e}`);
      if (config.others.debug && e.stack && !(e instanceof CommandError)) sender.tell(`§c${e.stack}`);
    }
    
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
  
  load() {
    const showError = (msg) => {
      console.error(msg);
      world.say(msg);
    }
    
    const wait = COMMANDS.map(name => {
      return import(`../commands/${name}`)
        .then(file => this.create(file.default))
        .catch(e => showError(`[CommandManager] §cError: failed to load command: ${name}\n${e}\n${e.stack}`));
    });
    Promise.all(wait).then(data => {
      if (config.others.debug)
        console.warn(`[CommandManager] Registered ${data.filter(Boolean).length}/${COMMANDS.length} commands`);
    })
  }
  
  create(command) {
    this.registeredCommands.set(command.name, command);
    return command;
  }
}
