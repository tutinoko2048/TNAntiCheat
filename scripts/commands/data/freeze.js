import { Util } from '../../util/util';
import { CommandError } from '../CommandError';
import { Command } from '../Command';

const freezeCommand =  new Command({
  name: 'freeze',
  description: 'プレイヤーを移動できなく(フリーズ状態に)します',
  args: [ '<name: playerName> <value: boolean>' ],
  aliases: [],
  permission: (player) => Util.isOP(player)
}, (origin, args, handler) => {
  const [ _playerName, value ] = args;
  if (!_playerName) throw new CommandError('プレイヤー名を入力してください');
  const playerName = Util.parsePlayerName(_playerName);
  
  const player = Util.getPlayerByName(playerName);
  if (!player) throw new CommandError(`プレイヤー ${playerName} が見つかりませんでした`);
  const freezeState = toBoolean(value);

  const res = Util.runCommandSafe(`inputpermission set @s movement ${freezeState ? 'disabled' : 'enabled'}`, player);
  if (!res) throw new CommandError('コマンドの実行中にエラーが発生しました');
  
  if (freezeState) handler.ac.frozenPlayerMap.set(player.id, player.location);
  else handler.ac.frozenPlayerMap.delete(player.id);

  origin.broadcast(Util.decorate(`§7${origin.name} >> §a${player.name} のフリーズを ${freezeState} に設定しました`));
  Util.writeLog({ type: 'command.freeze', message: `FreezeState: ${freezeState}\nExecuted by ${origin.name}` }, player);

});

function toBoolean(str) {
  if (typeof str !== 'string') throw new CommandError('Boolean(true|false)を入力してください');
  if (str.toLowerCase() === 'true') return true;
  else if (str.toLowerCase() === 'false') return false;
  else throw new CommandError('Boolean(true|false)を入力してください');
}

export default freezeCommand;