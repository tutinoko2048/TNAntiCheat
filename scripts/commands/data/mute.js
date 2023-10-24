import { Util } from '../../util/util';
import { CommandError } from '../CommandError';
import { Command } from '../Command';
import { BanManager } from '../../util/BanManager';

const muteCommand = new Command({
  name: 'mute',
  description: 'プレイヤーをミュートします',
  args: [ '[name: playerName] [value: boolean]' ],
  aliases: [ 'muto', 'myuto' ],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const [ _targetName, value ] = args;
  const targetName = Util.parsePlayerName(_targetName, origin.isPlayerOrigin() && origin.sender);
  if (!targetName && origin.isServerOrigin()) throw new CommandError('対象のプレイヤーを指定してください');

  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const target = targetName ? Util.getPlayerByName(targetName) : sender;
  if (!target) throw new CommandError(`プレイヤー ${targetName} が見つかりませんでした`);
  const muteState = value ? toBoolean(value) : !BanManager.isMuted(target);
  
  const err = () => { throw new CommandError(`${target.name} のミュートに失敗しました (Education Editionがオフになっている可能性があります)`) }
  const res = BanManager.setMuted(target, muteState);
  if (!res) err();
  
  origin.broadcast(Util.decorate(`§7${origin.name} >> §a${target.name} のミュートを ${muteState} に設定しました`));
  if (muteState) Util.notify('§o§eあなたはミュートされています', target);
  Util.writeLog({ type: 'command.mute', message: `MuteState: ${muteState}\nExecuted by ${origin.name}` }, target);

});

function toBoolean(str) {
  if (typeof str !== 'string') throw new CommandError('Boolean (true|false)を入力してください');
  if (str.toLowerCase() === 'true') return true;
  else if (str.toLowerCase() === 'false') return false;
  else throw new CommandError('Boolean(true|false)を入力してください');
}

export default muteCommand;