import config from '../config.js';
import { world, Player, system } from '@minecraft/server';


/** @enum {'Player' | 'ScriptEvent' | 'Server'} */
export const CommandOriginType = /** @type {const} */ ({
  Player: 'Player',
  ScriptEvent: 'ScriptEvent',
  Server: 'Server'
});

/** @abstract */
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
  
  /**
   * @abstract
   * @type {CommandOriginType}
   */
  get type() {
    throw Error('should be implemented in subclass.');
  }
  
  /** @arg {string} message */
  broadcast(message) {
    const overworld = world.getDimension('overworld');
    config.logger.sendws
      ? overworld.runCommand(`say "${message}"`)
      : world.sendMessage(message);
    if (this.isServerOrigin()) console.warn(message);
    if (config.logger.emitScriptEvent !== '') {
      system.sendScriptEvent(config.logger.emitScriptEvent, message);
    }
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

  /** @type {CommandOriginType} */
  get type() { return CommandOriginType.Player }
  
  /** @type {string} */
  get name() { return this.sender.name }
  
  /** @type {Player} */
  get sender() { return this.#sender }
  
  /** @arg {string|import('@minecraft/server').RawMessage} message */
  send(message) {
    return this.sender.sendMessage(message);
  }
}

// scripteventコマンドからの場合
export class ScriptEventCommandOrigin extends PlayerCommandOrigin {

  /** @type {CommandOriginType} */
  get type() { return CommandOriginType.ScriptEvent }
}

// scripteventのsourceTypeがServerの場合
export class ServerCommandOrigin extends CommandOrigin {

  /** @type {CommandOriginType} */
  get type() { return CommandOriginType.Server }

  /** @type {string} */
  get name() { return 'Server' }
  
  /** @arg {string} message */
  send(message) {
    console.warn(message);
    if (config.logger.emitScriptEvent !== '') {
      system.sendScriptEvent(config.logger.emitScriptEvent, message);
    }
  }
}