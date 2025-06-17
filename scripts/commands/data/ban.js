import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, Duration, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { BanManager } from '../../util/BanManager';
import { AdminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:ban',
    description: '§aプレイヤーをBanします',
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    if (params.target.length === 0) return failure('セレクターに合う対象がありません');
    if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');

    const target = params.target[0];
    const reason = params.reason;
    const duration = params.duration;

    if (Util.isHost(target)) return failure('ホストをBANすることはできません');

    let expireAt;
    let expireAtMessage;
    if (duration) {
      const ms = Duration.toMS(duration);
      if (ms > 0) {
        expireAt = Date.now() + ms;
        expireAtMessage = `${Util.getTime(expireAt, true)} (${Util.formatDuration(ms)})`;
      }
    }
    const message = [`§7Reason: §r${reason ?? '-'}`, `§7ExpireAt: §r${expireAtMessage}`].filter(Boolean).join('\n');

    system.run(() => {
      const success = BanManager.ban(target, {
        reason,
        expireAt,
        message: `reason=${reason ?? 'null'}${expireAtMessage ? `, expireAt=${expireAtMessage}` : ''}`
      });
      if (!success) return origin.sendMessage('§cBanに失敗しました');

      Util.notify(`§7${origin.getName()} >> ${target.name} をbanしました\n${message}`);
      Util.writeLog({
        type: 'command.ban',
        message: `Banned by ${origin.getName()}\n${message}`,
      }, target);
    });

    return CustomCommandStatus.Success;
  }, {
    target: CustomCommandParamType.PlayerSelector,
    reason: [CustomCommandParamType.String],
    duration: [CustomCommandParamType.String],
  });
};
