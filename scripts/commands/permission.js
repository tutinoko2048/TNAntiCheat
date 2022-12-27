import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';
import { Permissions } from '../util/Permissions';

export default {
  name: 'permission',
  description: 'プレイヤーの権限を操作します',
  args: [
    'list',
    'add <builder|admin> [name: playerName]',
    'remove <builder|admin> [name: playerName]'
  ],
  aliases: [ 'permissions', 'perm', 'perms' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    const [ subcmd, type, _playerName ] = args;
    const playerName = Util.parsePlayerName(_playerName);
    if (subcmd === 'list') {
      sender.tell(`§aPermissions:§r\n${Permissions.list().map(p => `- ${p}`).join('\n')}`);
      
    } else if (subcmd === 'add') {
      const player = playerName ? Util.getPlayerByName(playerName) : sender;
      if (!player) throw new CommandError(`プレイヤー "${playerName}" は見つかりませんでした`);
      if (!Permissions.isValid(type)) throw new CommandError(`権限 "${type}" は有効な値ではありません\n§f- !permission add <builder|admin> [name: playerName]`);
      if (Permissions.has(player, type)) throw new CommandError(`${player.name} は既に権限を持っています`);
      Permissions.add(player, type);
      Util.notify(`§7${sender.name} >> §e${player.name} に permission:${type} を付与しました`);
      
    } else if (subcmd === 'remove') {
      const player = playerName ? Util.getPlayerByName(playerName) : sender;
      if (!player) throw new CommandError(`プレイヤー "${playerName}" は見つかりませんでした`);
      if (!Permissions.isValid(type)) throw new CommandError(`権限 "${type}" は有効な値ではありません\n§f- !permission remove <builder|admin> [name: playerName]`);
      if (!Permissions.has(player, type)) throw new CommandError(`${player.name} は権限を持っていません`);
      Permissions.remove(player, type);
      Util.notify(`§7${sender.name} >> §e${player.name} から permission:${type} を剥奪しました`);
      
    } else {
      throw new CommandError(`サブコマンド "${subcmd}" は有効な値ではありません\n§f- !permission <list|add|remove>`);
    }
  }
}