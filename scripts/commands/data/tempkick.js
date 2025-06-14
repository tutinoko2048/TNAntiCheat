import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { adminPermission } from '../utils';

export default () => {
  commandHandler.register(
    {
      name: 'tn:tempkick',
      description: 'プレイヤーを強制退出させます(復帰可能)',
      aliases: ['tn:disconnect'],
      permission: adminPermission,
    },
    (params, origin) => {
      if (!origin.isSendable()) return CustomCommandStatus.Failure;

      if (params.target.length === 0) return failure('セレクターに合う対象がありません');
      if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');

      const target = params.target[0];
      const reason = params.reason;

      if (Util.isHost(target)) return failure('ホストを強制退出させることはできません');

      system.run(() => {
        Util.disconnect(target);

        Util.writeLog({
          type: 'command.tempkick',
          message: `Tempkicked by ${origin.getName()}\n§7Reason: §r${reason ?? '-'}`,
        }, target);
      });

      return CustomCommandStatus.Success;
    },
    {
      target: CustomCommandParamType.PlayerSelector,
      reason: [CustomCommandParamType.String],
    }
  );
};