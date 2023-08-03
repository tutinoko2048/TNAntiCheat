import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';
import { Command } from '../util/Command';

const tempkickCommand = new Command({
  name: 'tempkick',
  description: 'プレイヤーを強制退出させます(復帰可能なkick)',
  args: [ '<name: playerName> [reason: string] [expects: boolean]' ],
  aliases: [ 'disconnect' ],
  permission: (player) => Util.isOP(player),
}, (origin, args) => {
  const [ _playerName, reason = '-', expect ] = args;
  if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
  const playerName = Util.parsePlayerName(_playerName);
  
  const player = Util.getPlayerByName(playerName, expect === 'true');
  if (!player) throw new CommandError(`プレイヤー: ${playerName} が見つかりませんでした`);
  if (origin.isPlayerOrigin() && origin.sender.name === player.name) throw new CommandError('自分をkickすることはできません');
  origin.broadcast(Util.decorate(`§7${origin.name} >> §rプレイヤー: §c${player.name}§r をtempkickしました(再参加できます)\n§7Reason: §r${reason}`));
  Util.writeLog({ type: 'command.tempkick', message: `Tempkicked by ${origin.name}\nReason: ${reason}` }, player);
  Util.disconnect(player);
});

export default tempkickCommand;