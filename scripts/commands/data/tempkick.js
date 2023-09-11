import { Util } from '../../util/util';
import { CommandError } from '../CommandError';
import { Command } from '../Command';

const tempkickCommand = new Command({
  name: 'tempkick',
  description: 'プレイヤーを強制退出させます(復帰可能なkick)',
  args: [ '<name: playerName> [reason: string]' ],
  aliases: [ 'disconnect' ],
  permission: (player) => Util.isOP(player),
}, (origin, args) => {
  const [ _playerName, reason = '-' ] = args;
  if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
  const playerName = Util.parsePlayerName(_playerName, origin.isPlayerOrigin() && origin.sender);
  
  const player = Util.getPlayerByName(playerName);
  if (!player) throw new CommandError(`プレイヤー: ${playerName} が見つかりませんでした`);
  origin.broadcast(Util.decorate(`§7${origin.name} >> §rプレイヤー: §c${player.name}§r をtempkickしました(再参加できます)\n§7Reason: §r${reason}`));
  Util.writeLog({ type: 'command.tempkick', message: `Tempkicked by ${origin.name}\nReason: ${reason}` }, player);
  Util.disconnect(player);
});

export default tempkickCommand;