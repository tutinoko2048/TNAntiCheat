import { CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { AdminPermission } from '../utils';
import { AdminPanel } from '../../form/AdminPanel';

export default () => {
  commandHandler.register({
    name: 'tn:setting',
    description: '§a管理者用パネルを表示します',
    permission: AdminPermission,
    aliases: [ 'tn:adminpanel', 'tn:panel' ],
  }, (_, origin) => {
    const player = origin.getPlayer();
    if (!player) return failure('このコマンドはここでは実行できません');
    
    system.run(() => {
      new AdminPanel(player).show();
    });
    
    return CustomCommandStatus.Success;
  }, {});
}
