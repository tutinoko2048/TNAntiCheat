import { Util } from '../util/util';
import { Command } from '../util/Command';
import { ModalFormData } from '@minecraft/server-ui';

const unbanCommand = new Command({
  name: 'unban',
  description: 'プレイヤーのBanを解除します',
  args: [ '', '<name: playerName>' ],
  aliases: [ 'pardon' ],
  permission: (player) => Util.isOP(player)
}, (sender, args) => {
  const [ _playerName ] = args;
  
  if (_playerName) {
    const playerName = Util.parsePlayerName(_playerName);
    Util.addUnbanQueue(playerName);
    Util.notify(`プレイヤー: §c${playerName}§r をunbanのリストに追加しました`, sender);
    Util.writeLog({ type: 'command.unban', playerName, message: `Executed by ${sender.name}` });
  } else {
    showQueue(sender).catch(console.error);
  }
});

export default unbanCommand;

/** @arg {import('@minecraft/server').Player} player */
async function showQueue(player) {
  const queue = Util.getUnbanQueue()
  const form = new ModalFormData();
  form.title('Unban Queue');
  for (const entry of queue) form.toggle(entry.name, true);
  
  const { canceled, formValues } = await Util.showFormToBusy(player, form);
  if (canceled) return;
  
  formValues.forEach((value, i) => {
    player.sendMessage(`${queue[i].name} (${queue[i].source}) を ${value} に設定しました`);
  });
}
