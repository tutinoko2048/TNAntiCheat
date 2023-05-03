import { ActionFormData } from '@minecraft/server-ui';
import toJson from '../lib/toJson';
import { Util } from '../util/util';
import { Data } from '../util/Data';
import { CommandError } from '../util/CommandError';
import { Command } from '../util/Command';

const dataCommand = new Command({
  name: 'data',
  description: '内部の保存データにアクセスできます (ex: config.nukerでnukerのconfigを表示)',
  aliases: [],
  args: [
    'get <path: string>'
  ],
  permission: (player) => Util.isOP(player),
  disableScriptEvent: true
}, (sender, args) => {
  const [ mode, path ] = args;
  if (!mode || !path) throw new CommandError('args: get <path: string>');
  if (mode === 'get') {
    const res = Data.getByPath(path);
    sendForm(sender, path, res);
  } else {
    throw new CommandError('unexpected mode received, only accepts "get"');
  }
});

/** @param {import('@minecraft/server').Player} player */
function sendForm(player, path, ...args) {
  const message = args.map(v => {
    switch (typeof v) {
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

export default dataCommand;