import config from '../config.js';
import { Util } from '../util/util';
import { Permissions } from '../util/Permissions';
import { CommandError } from '../util/CommandError';

export default {
  name: 'deop',
  description: '管理者権限を削除します',
  args: [ '[name: playerName]' ],
  aliases: [],
  permission: (player) => player.isOp(),
  func: (sender, args) => {
    const playerName = Util.parsePlayerName(args[0]);
    const player = playerName ? Util.getPlayerByName(playerName) : sender;
    if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
    if (!Util.isOP(player)) throw new CommandError(`${player.name} は権限を持っていません`);
    Permissions.remove(player, 'admin');
    Util.notify(`§7${sender.name} >> §e${player.name} の管理者権限を削除しました`);
  }
}