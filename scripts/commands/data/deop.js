import { Util } from '../../util/util';
import { PermissionType, Permissions } from '../../util/Permissions';
import { CommandError } from '../CommandError';
import { Command } from '../Command';

const deopCommand = new Command({
  name: 'deop',
  description: '管理者権限を削除します',
  args: [ '[name: playerName]' ],
  aliases: [],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const targetName = Util.parsePlayerName(args[0]);
  if (!targetName && origin.isServerOrigin()) throw new CommandError('対象のプレイヤーを指定してください');
  
  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const target = targetName ? Util.getPlayerByName(targetName) : sender;
  
  if (!target) throw new CommandError(`プレイヤー ${targetName} が見つかりませんでした`);
  if (!Util.isOP(target)) throw new CommandError(`${target.name} は権限を持っていません`);
  Permissions.remove(target, PermissionType.Admin);
  origin.broadcast(Util.decorate(`§7${origin.name} >> §e${target.name} の管理者権限を削除しました`));
  Util.writeLog({ type: 'command.deop', message: `Executed by ${origin.name}` }, target);
});

export default deopCommand;