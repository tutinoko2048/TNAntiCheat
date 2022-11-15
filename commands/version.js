import { version as ver } from '../util/constants';

export const version = {
  name: 'version',
  description: '現在のバージョンを表示します',
  aliases: [ 'ver', 'bersion', 'ber', 'barsion', 'bar' ],
  func: (sender, args) => {
    sender.tell(`Running TN-AntiCheat v${ver}`);
  }
}