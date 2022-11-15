import { Util } from '../util/util';
import { AdminPanel } from '../modules/AdminPanel';

export const settingitem = {
  name: 'settingitem',
  description: '管理者用パネルを表示するためのアイテムを取得します',
  aliases: [ 'setingitem', 'adminitem', 'panelitem', 'configitem' ],
  permission: (player) => Util.isOP(player),
  func: (sender, args) => {
    sender.getComponent('minecraft:inventory').container.addItem(AdminPanel.getPanelItem());
    Util.notify('アイテムを取得しました。右クリック/長押しで管理者用パネルを開けます');
  }
}