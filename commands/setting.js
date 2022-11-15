import { Util } from '../util/util';
import { AdminPanel } from '../modules/AdminPanel';

export const setting = {
  name: 'setting',
  description: '管理者用パネルを表示します',
  aliases: [ 'settings', 'config', 'seting' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args, handler) => {
    new AdminPanel(handler.ac, sender).show(true);
  }
}