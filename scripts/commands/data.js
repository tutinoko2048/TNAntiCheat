import { world, system } from '@minecraft/server';
import { ActionFormData } from '@minecraft/server-ui';
import toJson from '../lib/toJson';
import config from '../config.js';
import chatFilter from '../chat_filter.js';
import { Util } from '../util/util';
import { Data } from '../util/Data';
import { CommandError } from '../util/CommandError';

export default {
  name: 'data',
  description: '内部の保存データにアクセスできます (ex: config.nukerでnukerのconfigを表示)',
  aliases: [],
  args: [
    'get <path: string>',
    //'<"config"|"filter"> set <path: string> <value: string>'
  ],
  permission: (player) => Util.isOP(player),
  disableScriptEvent: true,
  func: (sender, args) => {
    const [ mode, path, value ] = args;
    if (!mode || !path) throw new CommandError('args: get <path: string>');
    if (mode === 'get') {
      const res = Data.getByPath(path);
      sendForm(sender, path, res);
    } else {
      throw new CommandError('unexpected mode received, only accepts "get"');
    }
  }
}


function sendForm(player, path, ...args) {
  const message = args.map(v => {
    switch(typeof v) {
      case 'object': return toJson(v);
      default: return String(v);
    }
  }).join(' ');
  if (message == 'undefined') throw new CommandError('表示できる値がありません');
  const form = new ActionFormData()
    .title(path)
    .body(message + '\n ')
    .button('close');
  Util.showFormToBusy(player, form);
}