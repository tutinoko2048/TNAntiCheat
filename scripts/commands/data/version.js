import { VERSION } from '../../util/constants';
import { Command } from '../Command';

const versionCommand = new Command({
  name: 'version',
  description: '現在のバージョンを表示します',
  args: [ '' ],
  aliases: [ 'ver', 'bersion', 'ber', 'barsion', 'bar' ],
}, (origin) => {
  origin.send(`Running TN-AntiCheat v${VERSION}`);
});

export default versionCommand;