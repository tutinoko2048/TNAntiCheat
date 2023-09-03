import { Util } from '../../util/util';
import { CommandError } from '../CommandError';
import { PropertyIds } from '../../util/constants';
import { Command } from '../Command';

const muteCommand = new Command({
  name: 'mute',
  description: 'プレイヤーをミュートします',
  args: [ '<name: playerName> <value: boolean>' ],
  aliases: [ 'muto', 'myuto' ],
  permission: (player) => Util.isOP(player)
}, (origin, args) => {
  const [ _playerName, value ] = args;
  if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
  const playerName = Util.parsePlayerName(_playerName);
  
  const player = Util.getPlayerByName(playerName);
  if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
  const muteState = toBoolean(value);
  
  const err = () => { throw new CommandError(`${player.name} のミュートに失敗しました (Education Editionがオフになっている可能性があります)`) }
  
  const res = Util.runCommandSafe(`ability @s mute ${muteState}`, player);
  if (!res) err();
  
  player.setDynamicProperty(PropertyIds.mute, muteState);
  origin.broadcast(Util.decorate(`§7${origin.name} >> §a${player.name} のミュートを ${muteState} に設定しました`));
  Util.writeLog({ type: 'command.mute', message: `MuteState: ${muteState}\nExecuted by ${origin.name}` }, player);

});

function toBoolean(str) {
  if (typeof str !== 'string') throw new CommandError('Boolean (true|false)を入力してください');
  if (str.toLowerCase() === 'true') return true;
  else if (str.toLowerCase() === 'false') return false;
  else throw new CommandError('Boolean(true|false)を入力してください');
}

export default muteCommand;