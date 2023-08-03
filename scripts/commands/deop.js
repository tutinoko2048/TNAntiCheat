import { Util } from '../util/util';
import { Permissions } from '../util/Permissions';
import { CommandError } from '../util/CommandError';
import { Command } from '../util/Command';

const deopCommand = new Command({
  name: 'deop',
  description: '管理者権限を削除します',
  args: [ '[name: playerName]' ],
  aliases: [],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const playerName = Util.parsePlayerName(args[0]);
  if (!playerName && origin.isServerOrigin()) throw new CommandError('対象のプレイヤーを指定してください');
  
  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const player = playerName ? Util.getPlayerByName(playerName) : sender;
  
  if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
  if (!Util.isOP(player)) throw new CommandError(`${player.name} は権限を持っていません`);
  Permissions.remove(player, 'admin');
  Util.notify(`§7${origin.name} >> §e${player.name} の管理者権限を削除しました`);
  Util.writeLog({ type: 'command.deop', message: `Executed by ${origin.name}` }, player);
});

export default deopCommand;