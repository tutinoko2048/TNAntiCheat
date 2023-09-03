import { Util } from '../../util/util';
import { Command } from '../../util/Command';
import config from '../../config.js';

const moduleCommand = new Command({
  name: 'module',
  description: 'モジュール一覧を表示します',
  aliases: [ 'modules' ],
  args: [],
  permission: (player) => Util.isOP(player),
}, (origin) => {
  const modules = Object.keys(config).filter(key => isObject(config[key]) && 'state' in config[key]);
  origin.send('§lModules');
  origin.send(
    modules.map(m => `- ${m}: ${config[m].state ? '§o§aEnabled§r' : '§o§cDisabled§r'}`).join('\n')
  );
});

export default moduleCommand;

function isObject(item) {
  return typeof item === 'object' && item !== null;
}