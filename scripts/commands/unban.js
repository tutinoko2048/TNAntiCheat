import { Util } from '../util/util';
import unbanQueue from '../unban_queue.js';
import { Command } from '../util/Command';

const unbanCommand = new Command({
  name: 'unban',
  description: 'プレイヤーのBanを解除します(ワールドを閉じると消えるので注意)',
  args: [ '', '<name: playerName>' ],
  aliases: [],
  permission: (player) => Util.isOP(player)
}, (sender, args) => {
  const [ _playerName ] = args;
  if (_playerName) {
    const playerName = Util.parsePlayerName(_playerName);
    
    unbanQueue.push(playerName);
    Util.notify(`プレイヤー: §c${playerName}§r をunbanのリストに追加しました`, sender);
    
    Util.log({ type: 'command/unban', playerName, message: `by ${sender.name}` });
  }
  Util.notify(`§7Unban queue:\n§f${unbanQueue.join(', ')}`, sender);
});

export default unbanCommand;