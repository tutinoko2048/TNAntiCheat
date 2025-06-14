import { CustomCommandStatus, system } from '@minecraft/server';
import { ConfigPanel } from '../../form/ConfigPanel';
import { commandHandler, failure } from '../../lib/exports';
import { adminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:config',
    description: 'ConfigPanelを表示します',
    permission: adminPermission,
  }, (_, origin) => {
    const player = origin.getPlayer();
    if (!player) return failure('このコマンドはここでは実行できません');

    system.run(() => {
      new ConfigPanel(player);
    });

    return CustomCommandStatus.Success;
  }, {});
}