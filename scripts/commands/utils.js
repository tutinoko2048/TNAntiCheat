import { CommandPermissionLevel } from '@minecraft/server';
import { Util } from '../util/util';

/**
 * @param {import('../lib/exports').CommandOrigin} origin
 * @returns {boolean}
 */
function isOperator(origin) {
  if (origin.isServer()) return true;
  const player = origin.getPlayer();
  return player && Util.isOP(player);
}

/** @type {import('../lib/exports').CustomPermission} */
export const AdminPermission = {
  permissionLevel: CommandPermissionLevel.Admin,
  onVerify: (origin) => isOperator(origin) ? true : { error: 'このコマンドを実行する権限がありません' },
};
