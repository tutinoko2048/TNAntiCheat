import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';
import { Command } from '../util/Command';

const tempkickCommand = new Command({
  name: 'tempkick',
  description: 'プレイヤーを強制退出させます(復帰可能なkick)',
  args: [ '<name: playerName> [reason: string] [expects: boolean]' ],
  aliases: [ 'disconnect' ],
  permission: (player) => Util.isOP(player),
}, (sender, args) => {
  const [ _playerName, reason = '-', expect ] = args;
  if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
  const playerName = Util.parsePlayerName(_playerName);
  
  const player = Util.getPlayerByName(playerName, expect === 'true');
  if (!player) throw new CommandError(`プレイヤー: ${playerName} が見つかりませんでした`);
  if (sender.name === player.name) throw new CommandError('自分をkickすることはできません');
  Util.notify(`§7${sender.name} >> §rプレイヤー: §c${player.name}§r をtempkickしました(再参加できます)\n§7Reason: §r${reason}`);
  Util.log({ type: 'command.tempkick', message: `TempKicked by ${sender.name}\nReason: ${reason}` }, player);
  Util.disconnect(player);
});

export default tempkickCommand;