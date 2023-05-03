import { Util } from '../util/util';
import { ConfigPanel } from '../modules/ConfigPanel';
import { Command } from '../util/Command';

const configCommand = new Command({
  name: 'config',
  description: 'ConfigPanelを表示します',
  args: [ '' ],
  aliases: [ 'con' ],
  permission: (player) => Util.isOP(player),
}, (sender, _, manager) => {
    new ConfigPanel(manager.ac, sender, true);
});

export default configCommand;