import { Util } from '../util/util';
import { CommandError } from '../util/CommandError';
import { properties } from '../util/constants';

export default {
  name: 'mute',
  description: 'プレイヤーをミュートします',
  args: [ '<name: playerName> <value: boolean>' ],
  aliases: [ 'muto', 'myuto' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    const [ _playerName, value ] = args;
    if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
    const playerName = Util.parsePlayerName(_playerName);
    
    const player = Util.getPlayerByName(playerName);
    if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
    const mute = toBoolean(value);
    
    player.runCommandAsync(`ability @s mute ${mute}`).then(() => {
      player.setDynamicProperty(properties.mute, mute);
      Util.notify(`§7${sender.name} >> §a${player.name} のミュートを ${mute} に設定しました`);
    }).catch(() => {
      throw new CommandError(`${player.name} のミュートに失敗しました (Education Editionがオフになっている可能性があります)`);
    });
    
  }
}

function toBoolean(str) {
  if (typeof str !== 'string') throw new CommandError('Boolean (true/false)を入力してください');
  if (str.toLowerCase() === 'true') return true;
  else if (str.toLowerCase() === 'false') return false;
  else throw new CommandError('Boolean(true|false)を入力してください');
}