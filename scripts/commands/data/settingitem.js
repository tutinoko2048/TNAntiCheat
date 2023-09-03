import { Util } from '../../util/util';
import { AdminPanel } from '../../form/AdminPanel';
import { Command } from '../Command';
import { CommandError } from '../CommandError';

const itemCommand = new Command({
  name: 'settingitem',
  description: '管理者用パネルを表示するためのアイテムを取得します',
  args: [ '' ],
  aliases: [ 'item', 'wand', 'setingitem', 'adminitem', 'panelitem', 'configitem' ],
  permission: (player) => Util.isOP(player)
}, (origin) => {
  if (origin.isPlayerOrigin()) {
    origin.sender.getComponent('minecraft:inventory').container.addItem(AdminPanel.getPanelItem());
    Util.notify('アイテムを取得しました。右クリック/長押しで管理者用パネルを開けます', origin.sender);
    
  } else if (origin.isServerOrigin()) throw new CommandError('Serverからは実行できません');
});

export default itemCommand;