import config from '../config.js';
import { world } from '@minecraft/server';

/** @typedef {import('@minecraft/server').Player} Player */

export const CommandOriginType = /** @type {const} */ ({
  Player: 'Player',
  ScriptEvent: 'ScriptEvent',
  Server: 'Server'
});

/** @typedef {CommandOriginType[keyof CommandOriginType]} CommandOriginTypes */

export class CommandOrigin {
  constructor() {}
  
  /** @returns {this is PlayerCommandOrigin} */
  isPlayerOrigin() {
    return this instanceof PlayerCommandOrigin;
  }
  
  /** @returns {this is ScriptEventCommandOrigin} */
  isScriptEventOrigin() {
    return this instanceof ScriptEventCommandOrigin;
  }
  
  /** @returns {this is ServerCommandOrigin} */
  isServerOrigin() {
    return this instanceof ServerCommandOrigin;
  }
  
  /** @type {CommandOriginTypes} */
  get type() {
    if (this.isPlayerOrigin()) return CommandOriginType.Player;
    if (this.isScriptEventOrigin()) return CommandOriginType.ScriptEvent;
    if (this.isServerOrigin()) return CommandOriginType.Server;
    throw Error('invalid command origin type');
  }
  
  /** @arg {string} message */
  broadcast(message) {
    config.others.sendws
      ? world.getDimension('overworld').runCommandAsync(`say "${message}"`)
      : world.sendMessage(message);
    if (this.isServerOrigin()) console.warn(message);
  }
}

// チャット欄からの入力
export class PlayerCommandOrigin extends CommandOrigin {
  /** @type {Player} */
  #sender;
  
  /** @arg {Player} sender */
  constructor(sender) {
    super();
    this.#sender = sender;
  }
  
  /** @type {string} */
  get name() {
    return this.sender.name;
  }
  
  /** @type {Player} */
  get sender() {
    return this.#sender;
  }
  
  /** @arg {string|import('@minecraft/server').RawMessage} message */
  send(message) {
    return this.sender.sendMessage(message);
  }
}

// scripteventコマンドからの場合
export class ScriptEventCommandOrigin extends PlayerCommandOrigin {}

// scripteventのsourceTypeがServerの場合
export class ServerCommandOrigin extends CommandOrigin {
  constructor() {
    super()
  }
  
  /** @type {string} */
  get name() {
    return 'Server';
  }
  
  /** @arg {string} message */
  send(message) {
    return console.warn(message);
  }
}