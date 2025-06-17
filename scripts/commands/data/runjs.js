/* eslint no-unused-vars: 0 */

import { CommandPermissionLevel, CustomCommandStatus } from '@minecraft/server';
import { Util } from '../../util/util';
import * as mc from '@minecraft/server';
const { world, system } = mc;
import { Permissions } from '../../util/Permissions';
import config from '../../config.js';
import unbanQueue from '../../unban_queue.js';
import { DataManager } from '../../util/DataManager';
import { format } from '../../lib/formatter/main';
import { ModerationManager } from '../../util/ModerationManager';
import { commandHandler } from '../../lib/exports';

export default () => {
  commandHandler.register({
    name: 'tn:runjs',
    description: '§ddebug command.',
    aliases: [ 'tn:eval' ],
    permissionLevel: CommandPermissionLevel.Host,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;
    
    const player = origin.getPlayer();
    const context = {
      world,
      system,
      origin,
      player,
      self: player,
      print: (...args) => origin.sendMessage(inspect(...args)),
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      config,
      unbanQueue,
      DataManager,
      ModerationManager: BanManager,
      Permissions,
      Util,
    };
    
    const func = new Function(Object.keys(context).join(', '), params.code);
    system.run(async () => {
      try {
        await func(...Object.values(context));
      } catch (error) {
        origin.sendMessage(`§cEvalError: ${error.message}`);
      }
    });
    
    return CustomCommandStatus.Success;
  }, {
    code: mc.CustomCommandParamType.String,
  });
}

function inspect(...args) {
  const message = args.map(v => {
    switch (typeof v) {
      case 'object': return format(v, { hideFunction: false });
      default: return String(v);
    }
  }).join(' ');
  return message;
}