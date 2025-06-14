import { CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { AdminPermission } from '../utils';
import { AdminPanel } from '../../form/AdminPanel';

/** @param {import('../../ac').TNAntiCheat} ac */
export default (ac) => {
  commandHandler.register({
    name: 'tn:setting',
    description: '§a管理者用パネルを表示します',
    permission: AdminPermission,
  }, (_, origin) => {
    const player = origin.getPlayer();
    if (!player) return failure('このコマンドはここでは実行できません');
    
    system.run(() => {
      new AdminPanel(ac, player).show();
    });
    
    return CustomCommandStatus.Success;
  }, {});
}