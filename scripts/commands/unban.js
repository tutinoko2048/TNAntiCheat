import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';
import unbanQueue from '../unban_queue.js';

export default {
  name: 'unban',
  description: 'プレイヤーのBanを解除します(ワールドを閉じると消えるので注意)',
  args: [ '', '<name: playerName>' ],
  aliases: [],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    const [ _playerName ] = args;
    if (_playerName) {
      const playerName = Util.parsePlayerName(_playerName);
      
      unbanQueue.push(playerName);
      Util.notify(`プレイヤー: §c${playerName}§r をunbanのリストに追加しました`, sender);
    }
    Util.notify(`§7Unban queue:\n§f${unbanQueue.join(', ')}`, sender);
  }
}