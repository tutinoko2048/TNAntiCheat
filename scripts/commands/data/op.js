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
  const playerName = Util.parsePlayerName(args[0]);
  if (origin.isServerOrigin() && !playerName) throw new CommandError('対象のプレイヤーを指定してください');
  
  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const player = playerName ? Util.getPlayerByName(playerName) : sender;
  
  if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
  if (!player.isOp() && !config.others.fixBDS) throw new CommandError(`プレイヤー ${player.name} の権限が不足しています`);
  if (Util.isOP(player)) throw new CommandError(`${player.name} は既に権限を持っています`);
  Permissions.add(player, PermissionType.Admin);
  origin.broadcast(Util.decorate(`§7${origin.name} >> §e${player.name} に管理者権限を与えました`));
  Util.writeLog({ type: 'command.op', message: `Executed by ${origin.name}` }, player);
});

export default opCommand;