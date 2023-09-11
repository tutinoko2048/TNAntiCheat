import config from '../../config.js';
import { Util } from '../../util/util';
import { PermissionType, Permissions } from '../../util/Permissions';
import { CommandError } from '../CommandError.js';
import { Command } from '../Command.js';

const opCommand = new Command({
  name: 'op',
  description: 'TN-AntiCheatの管理者権限を取得します',
  args: [ '[name: playerName]' ],
  aliases: [ 'operator' ],
  permission: (player) => player.isOp() || (config.others.fixBDS && Permissions.has(player, PermissionType.Admin))
}, (origin, args) => {
  const targetName = Util.parsePlayerName(args[0]);
  if (origin.isServerOrigin() && !targetName) throw new CommandError('対象のプレイヤーを指定してください');
  
  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const target = targetName ? Util.getPlayerByName(targetName) : sender;
  
  if (!target) throw new CommandError(`プレイヤー ${targetName} が見つかりませんでした`);
  if (!target.isOp() && !config.others.fixBDS) throw new CommandError(`プレイヤー ${target.name} の権限が不足しています`);
  if (Util.isOP(target)) throw new CommandError(`${target.name} は既に権限を持っています`);
  Permissions.add(target, PermissionType.Admin);
  origin.broadcast(Util.decorate(`§7${origin.name} >> §e${target.name} に管理者権限を与えました`));
  Util.writeLog({ type: 'command.op', message: `Executed by ${origin.name}` }, target);
});

export default opCommand;