import { VERSION } from '../util/constants';

export default {
  name: 'version',
  description: '現在のバージョンを表示します',
  args: [ '' ],
  aliases: [ 'ver', 'bersion', 'ber', 'barsion', 'bar' ],
  func: (sender, args) => {
    sender.tell(`Running TN-AntiCheat v${VERSION}`);
  }
}