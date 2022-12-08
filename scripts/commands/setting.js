import { Util } from '../util/util';
import { AdminPanel } from '../modules/AdminPanel';

export default {
  name: 'setting',
  description: '管理者用パネルを表示します',
  args: [ '' ],
  aliases: [ 'settings', 'config', 'seting' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args, manager) => {
    new AdminPanel(manager.ac, sender).show(true);
  }
}