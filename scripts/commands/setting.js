import { Util } from '../util/util';
import { AdminPanel } from '../modules/AdminPanel';
import { Command } from '../util/Command';

const settingCommand = new Command({
  name: 'setting',
  description: '管理者用パネルを表示します',
  args: [ '' ],
  aliases: [ 'settings', 'seting' ],
  permission: (player) => Util.isOP(player)
}, (sender, _, manager) => {
  new AdminPanel(manager.ac, sender).show(true);
});

export default settingCommand;