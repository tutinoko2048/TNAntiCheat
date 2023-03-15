import { Util } from '../util/util';
import { ConfigPanel } from '../modules/ConfigPanel';

export default {
  name: 'config',
  description: 'ConfigPanelを表示します',
  args: [ '' ],
  aliases: [ 'con' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args, manager) => {
    new ConfigPanel(manager.ac, sender, true);
  }
}