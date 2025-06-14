import { CustomCommandStatus, system } from '@minecraft/server';
import { ConfigPanel } from '../../form/ConfigPanel';
import { commandHandler, failure } from '../../lib/exports';
import { AdminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:config',
    description: '§aConfigPanelを表示します',
    permission: AdminPermission,
  }, (_, origin) => {
    const player = origin.getPlayer();
    if (!player) return failure('このコマンドはここでは実行できません');

    system.run(() => {
      new ConfigPanel(player);
    });

    return CustomCommandStatus.Success;
  }, {});
}