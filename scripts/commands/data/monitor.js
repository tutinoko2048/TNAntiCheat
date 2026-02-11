import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { AdminPermission } from '../utils';
import { ModerationManager } from '../../util/ModerationManager';

export default () => {
  commandHandler.register({
    name: 'tn:monitor',
    description: '§a指定したプレイヤーに視点を固定します',
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    /** @type {import('@minecraft/server').Player | undefined} */
    let target;
    if (params.target) {
      if (params.target.length === 0) return failure('セレクターに合う対象がありません');
      if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');
      target = params.target[0];
    }

    system.run(() => {
      const player = origin.getPlayer();
      if (target) {
        ModerationManager.setMonitoringState(origin.getPlayer(), target);

        origin.sendMessage(`§7${origin.getName()} >> ${target.name} に視点を固定しました\n>> :_input_key.jump: でズームイン、:_input_key.sneak: でズームアウトできます`);
        Util.writeLog({
          type: 'command.monitor',
          message: `Monitored Target: ${target.name}\nExecuted by ${origin.getName()}`
        }, target);

      } else {
        ModerationManager.setMonitoringState(player);

        origin.sendMessage(`§7${origin.getName()} >> 視点の固定を解除しました`);
        Util.writeLog({
          type: 'command.monitor',
          message: `Monitoring Canceled\nExecuted by ${origin.getName()}`
        });
      }
    });

    return CustomCommandStatus.Success;
  }, {
    target: [CustomCommandParamType.PlayerSelector]
  });
}
