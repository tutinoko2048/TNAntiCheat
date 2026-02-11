import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { AdminPermission } from '../utils';
import { ModerationManager } from '../../util/ModerationManager';

export default function() {
  commandHandler.register({
    name: 'tn:freeze',
    description: '§aプレイヤーを移動できなく(フリーズ状態に)します',
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
    
    const freezeState = params.value ?? !ModerationManager.isFrozen(target);
    
    system.run(() => {
      ModerationManager.setFrozen(target, freezeState);
      
      origin.sendMessage(
        freezeState ? '§o§eあなたはフリーズされています' : '§o§eあなたのフリーズは解除されました'
      );
      Util.notify(`§7${origin.getName()} >> ${target.name} のフリーズを ${freezeState} に設定しました`);
      Util.writeLog({
        type: 'command.freeze',
        message: `FreezeState: ${freezeState}\nExecuted by ${origin.getName()}`
      }, target);
    });
    
    return CustomCommandStatus.Success;
  }, {
    target: [CustomCommandParamType.PlayerSelector],
    value: [CustomCommandParamType.Boolean]
  });
}
