import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';
import { Permissions } from '../util/Permissions';

export default {
  name: 'permission',
  description: 'プレイヤーの権限を操作します',
  args: [
    'list',
    'add <type: string> [name: playerName]',
    'remove <type: string> [name: playerName]'
  ],
  aliases: [ 'permissions', 'perm', 'perms' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    const [ subcmd, type, playerName ] = args;
    if (subcmd === 'list') {
      sender.tell(`§aPermissions:§r\n${Permissions.list().map(p => `- ${p}`).join('\n')}`);
      
    } else if (subcmd === 'add') {
      const player = playerName ? Util.getPlayerByName(playerName) : sender;
      if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
      if (!Permissions.isValid(type)) throw new CommandError(`権限 ${type} は有効な値ではありません`);
      if (Permissions.has(player, type)) throw new CommandError(`${player.name} は既に権限を持っています`);
      Permissions.add(player, type);
      Util.notify(`§e${player.name} に 権限 ${type} を与えました`);
      
    } else if (subcmd === 'remove') {
      const player = playerName ? Util.getPlayerByName(playerName) : sender;
      if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
      if (!Permissions.isValid(type)) throw new CommandError(`権限 ${type} は有効な値ではありません`);
      if (!Permissions.has(player, type)) throw new CommandError(`${player.name} は権限を持っていません`);
      Permissions.remove(player, type);
      Util.notify(`§e${player.name} から 権限 ${type} を剥奪しました`);
    } else {
      throw new CommandError('<list|add|remove>')
    }
  }
}