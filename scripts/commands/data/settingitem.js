import { CustomCommandStatus, system } from '@minecraft/server';
import { Util } from '../../util/util';
import { AdminPanel } from '../../form/AdminPanel';
import { commandHandler, failure } from '../../lib/exports';
import { AdminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:settingitem',
    description: '§a管理者用パネルを表示するためのアイテムを取得します',
    aliases: [ 'tn:wand' ],
    permission: AdminPermission,
  }, (_, origin) => {
    if (origin.isPlayer()) {
      const player = origin.getPlayer(true);
      if (!player) return failure('このコマンドはここでは実行できません');
      
      system.run(() => {
        player.getComponent('minecraft:inventory').container.addItem(AdminPanel.getPanelItem());
        Util.notify('アイテムを取得しました。右クリック/長押しで管理者用パネルを開けます', player);
      });
    }
    
    return CustomCommandStatus.Success;
  }, {});
}