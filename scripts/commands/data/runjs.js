/* eslint no-unused-vars: 0 */

import { Command } from '../Command';
import { Util } from '../../util/util';
import * as mc from '@minecraft/server';
const { world, system } = mc;
import { Permissions } from '../../util/Permissions';
import config from '../../config.js';
import unbanQueue from '../../unban_queue.js';
import { DataManager } from '../../util/DataManager';
import { format } from '../../lib/formatter/main';

const runjsCommand = new Command({
  name: 'runjs',
  description: 'debug command.',
  aliases: [ 'eval' ],
  args: [ '<code: string>' ],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const self = origin.isPlayerOrigin() ? origin.sender : null;
  
  eval(args.join(' '));
});

function inspect(...args) {
  const message = args.map(v => {
    switch (typeof v) {
      case 'object': return format(v, { hideFunction: false });
      default: return String(v);
    }
  }).join(' ');
  world.sendMessage(message);
}

export default runjsCommand;