import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { PermissionType, Permissions } from '../../util/Permissions';
import { AdminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:deop',
    description: '§a管理者権限を削除します',
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    /** @type {import('@minecraft/server').Player} */
    let target;
    if (params.target) {
      if (params.target.length === 0) return failure('セレクターに合う対象がありません');
      if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');
      target = params.target[0];
    } else {
      const player = origin.getPlayer();
      if (!player) return failure('対象のプレイヤーを指定してください');
      target = player;
    }

    if (!Util.isOP(target)) return failure(`${target.name} は権限を持っていません`);

    system.run(() => {
      Permissions.remove(target, PermissionType.Admin);
      
      Util.notify(`§7${origin.getName()} >> ${target.name} の管理者権限を削除しました`);
      Util.writeLog({
        type: 'command.deop',
        message: `Executed by ${origin.getName()}`,
      }, target);
    });

    return CustomCommandStatus.Success;
  }, {
    target: [CustomCommandParamType.PlayerSelector],
  });
};
