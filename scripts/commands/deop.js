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
    const [ playerName ] = args;
    if (playerName) {
      const player = Util.getPlayerByName(playerName);
      if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
      if (!Util.isOP(player)) throw new CommandError(`${player.name} は権限を持っていません`);
      Permissions.remove(player, 'admin');
      Util.notify(`§e${player.name} の管理者権限を削除しました`);
      
    } else {
      if (!Util.isOP(sender)) throw new CommandError(`${sender.name} は権限を持っていません`);
      Permissions.remove(sender, 'admin');
      Util.notify(`§e${sender.name} の管理者権限を削除しました`);
    }
  }
}