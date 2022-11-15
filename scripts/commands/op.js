import config from '../config.js';
import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';

export const op = {
  name: 'op',
  description: 'TN-AntiCheatの管理者権限を取得します',
  args: [ '', '<name: playerName>' ],
  aliases: [],
  permission: (player) => player.isOp(),
  func: (sender, args) => {
    const [ playerName ] = args;
    if (playerName) {
      const player = Util.getPlayerByName(playerName);
      if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
      if (Util.isOP(player)) throw new CommandError(`${player.name} は既に権限を取得しています`);
      player.addTag(config.permission.admin.tag);
      Util.notify(`§e${player.name} に管理者権限を与えました`);
      
    } else {
      if (Util.isOP(sender)) throw new CommandError(`${sender.name} は既に権限を取得しています`);
      sender.addTag(config.permission.admin.tag);
      Util.notify(`§e${sender.name} に管理者権限を与えました`);
    }
  }
}