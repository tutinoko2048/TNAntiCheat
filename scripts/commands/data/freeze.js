import { CustomCommandParamType, CustomCommandStatus, InputPermissionCategory, Player, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { AdminPermission } from '../utils';

/** @param {import('../../ac').TNAntiCheat} ac */
export default function(ac) {
  commandHandler.register({
    name: 'tn:freeze',
    description: '§aプレイヤーを移動できなく(フリーズ状態に)します',
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    /** @type {Player} */
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
    
    const freezeState = params.value ?? !ac.frozenPlayerMap.has(target.id);
    
    system.run(() => {
      target.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, !freezeState); // freeze is true so inputs should be false (disabled)
      target.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, !freezeState);
      if (freezeState) ac.frozenPlayerMap.set(target.id, target.location);
      else ac.frozenPlayerMap.delete(target.id);
      
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