import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { AdminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:kick',
    description: '§aプレイヤーをKickします',
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    if (params.target.length === 0) return failure('セレクターに合う対象がありません');
    if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');

    const target = params.target[0];
    const reason = params.reason;

    if (Util.isHost(target)) return failure('ホストをKickすることはできません');

    system.run(() => {
      const success = Util.kick(target, `reason=${reason ?? 'null'}`);
      if (!success) return origin.sendMessage('§cKickに失敗しました');
      
      Util.notify(`§7${origin.getName()} >> §fプレイヤー: §c${target.name}§r をkickしました\n§7Reason: §r${reason}`);
      Util.writeLog({
        type: 'command.kick',
        message: `Kicked by ${origin.getName()}\nReason: ${reason ?? '-'}`,
      }, target);
    });

    return CustomCommandStatus.Success;
  }, {
    target: CustomCommandParamType.PlayerSelector,
    reason: [CustomCommandParamType.String],
  });
};