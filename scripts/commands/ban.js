import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';
import { Command } from '../util/Command';

const banCommand =  new Command({
  name: 'ban',
  description: 'プレイヤーをBanします',
  args: [ '<name: playerName> [reason: string] [expects: boolean]' ],
  aliases: [],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const [ _playerName, reason, expect ] = args;
  if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
  const playerName = Util.parsePlayerName(_playerName);
  
  const player = Util.getPlayerByName(playerName, expect === 'true');
  if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
  if (origin.isPlayerOrigin() && origin.sender.name === player.name) throw new CommandError('自分をbanすることはできません');
  Util.ban(player, `Reason: ${reason ?? '-'}`, reason ?? '(from command)');
  
  origin.broadcast(Util.decorate(`§7${origin.name} >> §fプレイヤー: §c${player.name}§r をbanしました\n§7Reason: §r${reason ?? '-'}`));
  Util.writeLog({ type: 'command.ban', message: `Banned by ${origin.name}\nReason: ${reason ?? '-'}` }, player);
});

export default banCommand;