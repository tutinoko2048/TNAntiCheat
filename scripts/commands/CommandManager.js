import { world } from '@minecraft/server';
import { Util } from '../util/util'
import { CommandError } from './CommandError';
import config from '../config.js';
import { COMMANDS } from './index';
import { PlayerCommandOrigin, ScriptEventCommandOrigin, ServerCommandOrigin } from './CommandOrigin';

/** @typedef {import('./types').CommandData} CommandData */
/** @typedef {import('../ac').TNAntiCheat} TNAntiCheat */

export class CommandManager {
  /** @type {TNAntiCheat} */
  #ac;

  /** @param {TNAntiCheat} ac */
  constructor(ac) {
    this.#ac = ac;
    
    if (config.others.debug) console.warn('[CommandManager] initialized');

    /** @type {Map<string, CommandData>} */
    this.registeredCommands = new Map();
    
    this.load();
  }

  /** @type {TNAntiCheat} */
  get ac() {
    return this.#ac;
  }
  
  /** @type {string} */
  get prefix() {
    return config.command.prefix;
  }
  
  /**
   * @arg {import('./types').PlayerCommandInput} ev
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
      // broadcastを止める方法がなくなったため無効化
      //if (!scriptEvent) { // コマンドが見つからなかったら非表示にだけして他のアドオンにも回す
      //  ev.targets.length = 0;
      //}
      return; //Util.notify('§cError: コマンドが見つかりませんでした', sender);
    }
    
    await Util.cancel(ev); // コマンドがあったらキャンセル
    if (command.permission && !command.permission(sender)) return Util.notify('§cError: 権限がありません', sender);
    if (scriptEvent && command.disableScriptEvent) return Util.notify('§cこのコマンドはScriptEventからの実行を許可されていません', sender);
    
    const origin = scriptEvent ? new ScriptEventCommandOrigin(sender) : new PlayerCommandOrigin(sender);
    try {
      command.func(origin, args, this);
    } catch (e) {
      origin.send(Util.decorate(`§c${e}`));
      if (config.others.debug && e.stack && !(e instanceof CommandError)) origin.send(`§c${e.stack}`);
    }
  }
  
  /**
   * SourceTypeがServerの時動く
   * @arg {import('./types').ServerCommandInput} ev
   */
  async handleFromServer(ev) {
    const { message } = ev;
    if (!config.command.enableConsole) return;
    
    const [ commandName, ...args ] = Util.splitNicely(message);
    const command = this.getCommand(commandName);
    if (!command) return console.error(Util.decorate('Error: コマンドが見つかりませんでした'));
    if (command.disableScriptEvent) return console.error(Util.decorate('このコマンドはScriptEventからの実行を許可されていません'));

    const origin = new ServerCommandOrigin();
    try {
      command.func(origin, args, this);
    } catch (e) {
      origin.send(String(e));
      if (config.others.debug && e.stack && !(e instanceof CommandError)) origin.send(String(e));
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
      world.sendMessage('§c' + msg);
    }
    
    const wait = COMMANDS.map(async name => {
      return import(`./data/${name}`)
        .then(file => this.create(file.default))
        .catch(e => showError(`[CommandManager] Error: failed to load command: ${name}\n${e}\n${e.stack}`));
    });
    
    const data = await Promise.all(wait);
    if (config.others.debug)
      console.warn(`[CommandManager] Registered ${data.filter(Boolean).length}/${COMMANDS.length} commands`);
  }
  
  /** @param {import('./Command').Command} command */
  create(command) {
    this.registeredCommands.set(command.data.name, command.data);
    return command;
  }
}
