import { Util } from '../../util/util';
import { AdminPanel } from '../../form/AdminPanel';
import { Command } from '../../util/Command';
import { CommandError } from '../../util/CommandError';

const settingCommand = new Command({
  name: 'setting',
  description: '管理者用パネルを表示します',
  args: [ '' ],
  aliases: [ 'settings', 'seting' ],
  permission: (player) => Util.isOP(player)
}, (origin, _, manager) => {
  if (origin.isPlayerOrigin()) new AdminPanel(manager.ac, origin.sender).show(true);
  else if (origin.isServerOrigin()) throw new CommandError('Serverからは実行できません');
});

export default settingCommand;