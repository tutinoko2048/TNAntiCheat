import { Util } from '../../util/util';
import { CommandError } from '../CommandError';
import { Command } from '../Command';
import { BanManager } from '../../util/BanManager';
import { Duration } from '../../lib/duration/main';

const banCommand = new Command({
  name: 'ban',
  description: 'プレイヤーをBanします',
  args: [ '<name: playerName> [reason: string] [duration: Duration]' ],
  aliases: [],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const [ _playerName, reason, _duration ] = args;
  if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
  const playerName = Util.parsePlayerName(_playerName);
  
  const player = Util.getPlayerByName(playerName);
  if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
  if (origin.isPlayerOrigin() && origin.sender.name === player.name) throw new CommandError('自分をBANすることはできません');
  if (Util.isOwner(player)) throw new CommandError('ホストをBANすることはできません');

  let expireAt;
  let expireAtMessage;
  if (_duration) {
    const ms = Duration.toMS(_duration);
    if (ms > 0) {
      expireAt = Date.now() + ms;
      expireAtMessage = `\n§7ExpireAt: §r${Util.getTime(expireAt, true)} (${Util.formatDuration(ms)})`;
    }
  }
  let message = (
    `§7${origin.name} >> §fプレイヤー: §c${player.name}§r をbanしました\n` +
    `§7Reason: §r${reason ?? '-'}`
  );

  BanManager.ban(player, { reason, message: '-', expireAt });
  origin.broadcast(Util.decorate(`${message}${expireAtMessage ?? ''}`));
  Util.writeLog({
    type: 'command.ban',
    message: `Banned by ${origin.name}\nReason: ${reason ?? '-'}${expireAtMessage ?? ''}`
  }, player);
});

export default banCommand;