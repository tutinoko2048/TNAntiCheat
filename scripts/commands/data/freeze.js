import { CustomCommandParamType, CustomCommandStatus, InputPermissionCategory, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { adminPermission } from '../utils';

/** @param {import('../../ac').TNAntiCheat} ac */
export default function(ac) {
  commandHandler.register({
    name: 'tn:freeze',
    description: 'プレイヤーを移動できなく(フリーズ状態に)します',
    permission: adminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    if (params.target.length === 0) return failure('セレクターに合う対象がありません');
    if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');
    
    const target = params.target[0];
    const freezeState = params.value ?? !ac.frozenPlayerMap.has(target.id);
    
    system.run(() => {
      target.inputPermissions.setPermissionCategory(InputPermissionCategory.Movement, freezeState);
      target.inputPermissions.setPermissionCategory(InputPermissionCategory.Camera, freezeState);
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
    target: CustomCommandParamType.PlayerSelector,
    value: [CustomCommandParamType.Boolean]
  });
}