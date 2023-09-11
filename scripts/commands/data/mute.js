import { Util } from '../../util/util';
import { CommandError } from '../CommandError';
import { PropertyIds } from '../../util/constants';
import { Command } from '../Command';

const muteCommand = new Command({
  name: 'mute',
  description: 'プレイヤーをミュートします',
  args: [ '[name: playerName] [value: boolean]' ],
  aliases: [ 'muto', 'myuto' ],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const [ _targetName, value ] = args;
  if (!_targetName) throw new CommandError('プレイヤー名を入力してください');
  const targetName = Util.parsePlayerName(_targetName, origin.isPlayerOrigin() && origin.sender);
  if (!targetName && origin.isServerOrigin()) throw new CommandError('対象のプレイヤーを指定してください');

  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const target = targetName ? Util.getPlayerByName(targetName) : sender;
  if (!target) throw new CommandError(`プレイヤー ${targetName} が見つかりませんでした`);
  const muteState = value ? toBoolean(value) : !target.getDynamicProperty(PropertyIds.mute);
  
  const err = () => { throw new CommandError(`${target.name} のミュートに失敗しました (Education Editionがオフになっている可能性があります)`) }
  
  const res = Util.runCommandSafe(`ability @s mute ${muteState}`, target);
  if (!res) err();
  
  target.setDynamicProperty(PropertyIds.mute, muteState);
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