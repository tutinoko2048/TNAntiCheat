import { Util } from '../util/util';

/**
 * @param {import('../lib/exports').CommandOrigin} origin
 * @returns {boolean}
 */
function isAdmin(origin) {
  if (origin.isServer()) return true;
  const player = origin.getPlayer();
  return player && Util.isOP(player);
}

/**
 * @param {import('../lib/exports').CommandOrigin} origin
 */
//TODO - operatorPermissionに変えたいかも
export const adminPermission = (origin) => isAdmin(origin) ? true : { error: 'このコマンドを実行する権限がありません' };
