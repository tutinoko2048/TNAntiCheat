import { Util } from '../util/util';
import * as mc from '@minecraft/server';
const { world, system } = mc;
import toJson from '../lib/toJson';
import { Permissions } from '../util/Permissions';
import config from '../config.js';
import unbanQueue from '../unban_queue.js';
import { Data } from '../util/Data';

export default {
  name: 'runjs',
  aliases: [ 'eval' ],
  args: [ '<code: string>' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    eval(args.join(' '));
  }
}

function inspect(...args) {
  const message = args.map(v => {
    switch (typeof v) {
      case 'object': return toJson(v);
      default: return String(v);
    }
  }).join(' ');
  world.sendMessage(message);
}