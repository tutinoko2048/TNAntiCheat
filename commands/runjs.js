import { Util } from '../util/util';
import * as mc from '@minecraft/server';
import toJson from '../util/toJson';

export const runjs = {
  name: 'runjs',
  aliases: [ 'eval' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    eval(args.join(' '));
  }
}