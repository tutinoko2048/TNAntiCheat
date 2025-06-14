import { CustomCommandParamType, CustomCommandStatus, system } from '@minecraft/server';
import { Permissions } from '../../util/Permissions';
import { Util } from '../../util/util';
import { commandHandler, failure } from '../../lib/exports';
import { adminPermission } from '../utils';
import { PermissionEnum } from '../enums';

export default () => {
  commandHandler.register({
    name: 'tn:permissionremove',
    description: 'プレイヤーの権限を削除します',
    permission: adminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;
    
    if (params.target.length === 0) return failure('セレクターに合う対象がありません');
    if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');
    
    const target = params.target[0];
    const permissionType = params.permission;

    if (!Permissions.has(target, permissionType)) {
      return failure(`${target.name} は ${permissionType} の権限を持っていません`);
    }
    
    system.run(() => {
      Permissions.remove(target, permissionType);

      Util.notify(`§a${target.name} から ${permissionType} 権限を削除しました`);
      Util.writeLog({ 
        type: 'permission.remove', 
        message: `Permission "${permissionType}" has been removed`,
      }, target);
    });
      
    return CustomCommandStatus.Success;
  }, {
    target: CustomCommandParamType.PlayerSelector,
    permission: PermissionEnum,
  });
}