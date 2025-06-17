import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { ModerationManager } from '../../util/ModerationManager';
import { AdminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:mute',
    description: '§aプレイヤーをミュートします',
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    if (params.target.length === 0) return failure('セレクターに合う対象がありません');
    if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');

    const target = params.target[0];
    const muteState = params.value ?? !ModerationManager.isMuted(target);

    system.run(() => {
      const success = ModerationManager.setMuted(target, muteState);
      if (!success) return origin.sendMessage('操作に失敗しました (Education Editionがオフになっている可能性があります)');
      
      origin.sendMessage(
        muteState ? '§o§eあなたはミュートされています' : '§o§eあなたのミュートは解除されました'
      );
      Util.notify(`§7${origin.getName()} >> ${target.name}§r§7 のミュートを ${muteState} に設定しました`);
      Util.writeLog({
        type: 'command.mute',
        message: `MuteState: ${muteState}\nExecuted by ${origin.getName()}`
      }, target);
    });
      
    return CustomCommandStatus.Success;
  }, {
    target: CustomCommandParamType.PlayerSelector,
    value: [CustomCommandParamType.Boolean],
  });
};