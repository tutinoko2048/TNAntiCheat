import { Util } from '../../util/util';
import { CommandError } from '../CommandError';
import { Command } from '../Command';

const freezeCommand =  new Command({
  name: 'freeze',
  description: 'プレイヤーを移動できなく(フリーズ状態に)します',
  args: [ '[name: playerName] [value: boolean]' ],
  aliases: [],
  permission: (player) => Util.isOP(player)
}, (origin, args, handler) => {
  const [ _targetName, value ] = args;
  if (!_targetName) throw new CommandError('プレイヤー名を入力してください');
  const targetName = Util.parsePlayerName(_targetName, origin.isPlayerOrigin() && origin.sender);
  if (!targetName && origin.isServerOrigin()) throw new CommandError('対象のプレイヤーを指定してください');
  
  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const target = targetName ? Util.getPlayerByName(targetName) : sender;
  if (!target) throw new CommandError(`プレイヤー ${targetName} が見つかりませんでした`);
  const freezeState = value ? toBoolean(value) : !handler.ac.frozenPlayerMap.has(target.id);

  const res = Util.runCommandSafe(`inputpermission set @s movement ${freezeState ? 'disabled' : 'enabled'}`, target);
  if (!res) throw new CommandError('コマンドの実行中にエラーが発生しました');
  
  if (freezeState) handler.ac.frozenPlayerMap.set(target.id, target.location);
  else handler.ac.frozenPlayerMap.delete(target.id);

  origin.broadcast(Util.decorate(`§7${origin.name} >> §a${target.name} のフリーズを ${freezeState} に設定しました`));
  if (freezeState) Util.notify('§o§eあなたはフリーズされています', target);
  Util.writeLog({ type: 'command.freeze', message: `FreezeState: ${freezeState}\nExecuted by ${origin.name}` }, target);
});

function toBoolean(str) {
  if (typeof str !== 'string') throw new CommandError('Boolean(true|false)を入力してください');
  if (str.toLowerCase() === 'true') return true;
  else if (str.toLowerCase() === 'false') return false;
  else throw new CommandError('Boolean(true|false)を入力してください');
}

export default freezeCommand;