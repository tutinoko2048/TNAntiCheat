import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';

export default {
  name: 'ban',
  description: 'プレイヤーをBanします',
  args: [ '<name: playerName> [reason: string] [expects: boolean]' ],
  aliases: [],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    const [ _playerName, reason, expect ] = args;
    if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
    const playerName = Util.parsePlayerName(_playerName);
    
    const player = Util.getPlayerByName(playerName, expect === 'true');
    if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
    if (sender.name === player.name) throw new CommandError('自分をbanすることはできません');
    Util.ban(player, reason);
    Util.notify(`${sender.name} >> プレイヤー: §c${player.name}§r をbanしました\n§7Reason: §r${reason}`);
  }
}