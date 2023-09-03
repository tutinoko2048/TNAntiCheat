import { Util } from '../../util/util';
import { CommandError } from '../../util/CommandError';
import { Permissions } from '../../util/Permissions';
import { Command } from '../../util/Command';

const permissionCommand = new Command({
  name: 'permission',
  description: 'プレイヤーの権限を操作します',
  args: [
    'list',
    'add <builder|admin> [name: playerName]',
    'remove <builder|admin> [name: playerName]'
  ],
  aliases: [ 'permissions', 'perm', 'perms' ],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const [ subcmd, type, _playerName ] = args;
  const playerName = Util.parsePlayerName(_playerName);
  if (subcmd === 'list') {
    origin.send(`§aPermissions:§r\n${Permissions.list().map(p => `- ${p}`).join('\n')}`);
    
  } else if (subcmd === 'add') {
    if (origin.isServerOrigin() && !playerName) throw new CommandError('対象のプレイヤーを指定してください');
    
    const sender = origin.isPlayerOrigin() ? origin.sender : null;
    const player = playerName ? Util.getPlayerByName(playerName) : sender;
    
    if (!player) throw new CommandError(`プレイヤー "${playerName}" は見つかりませんでした`);
    if (!Permissions.isValid(type)) throw new CommandError(`権限 "${type}" は有効な値ではありません\n§f- !permission add <builder|admin> [name: playerName]`);
    if (Permissions.has(player, type)) throw new CommandError(`${player.name} は既に権限を持っています`);
    Permissions.add(player, type);
    origin.broadcast(Util.decorate(`§7${origin.name} >> §e${player.name} に permission:${type} を付与しました`));
    Util.writeLog({ type: 'command.permission', message: `permission:${type}を付与しました\nExecuted by ${origin.name}` }, player);
    
  } else if (subcmd === 'remove') {
    if (origin.isServerOrigin() && !playerName) throw new CommandError('対象のプレイヤーを指定してください');
    
    const sender = origin.isPlayerOrigin() ? origin.sender : null;
    const player = playerName ? Util.getPlayerByName(playerName) : sender;
    
    if (!player) throw new CommandError(`プレイヤー "${playerName}" は見つかりませんでした`);
    if (!Permissions.isValid(type)) throw new CommandError(`権限 "${type}" は有効な値ではありません\n§f- !permission remove <builder|admin> [name: playerName]`);
    if (!Permissions.has(player, type)) throw new CommandError(`${player.name} は権限を持っていません`);
    Permissions.remove(player, type);
    origin.broadcast(Util.decorate(`§7${origin.name} >> §e${player.name} から permission:${type} を剥奪しました`));
    Util.writeLog({ type: 'command.permission', message: `permission:${type}を剥奪しました\nExecuted by ${origin.name}` }, player);
    
  } else {
    throw new CommandError(`サブコマンド "${subcmd ?? ''}" は有効な値ではありません\n§f- !permission <list|add|remove>`);
  }
});

export default permissionCommand;