import { Util } from '../../util/util';
import { ConfigPanel } from '../../form/ConfigPanel';
import { Command } from '../Command';
import { CommandError } from '../CommandError';

const configCommand = new Command({
  name: 'config',
  description: 'ConfigPanelを表示します',
  args: [ '' ],
  aliases: [ 'con' ],
  permission: (player) => Util.isOP(player),
}, (origin, _, manager) => {
  if (origin.isPlayerOrigin()) new ConfigPanel(manager.ac, origin.sender, true);
  else if (origin.isServerOrigin()) throw new CommandError('Serverからは実行できません');
});

export default configCommand;