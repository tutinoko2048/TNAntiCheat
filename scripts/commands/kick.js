import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';

export default {
  name: 'kick',
  description: 'プレイヤーをKickします',
  args: [ '<name: playerName> [reason: string] [expects: boolean]' ],
  aliases: [],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    const [ playerName, reason, expect ] = args;
    if (!playerName) throw new CommandError('プレイヤー名を入力してください');
    const player = Util.getPlayerByName(playerName, expect === 'true');
    if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
    if (sender.name === player.name) throw new CommandError('自分をkickすることはできません');
    Util.kick(player, reason);
    Util.notify(`${sender.name} >> プレイヤー: §c${player.name}§r をkickしました\n§7Reason: §r${reason}`);
  }
}