import { getTPS } from '../../util/tps';
import { CommandPermissionLevel, CustomCommandStatus } from '@minecraft/server';
import { commandHandler } from '../../lib/exports';

export default () => {
  commandHandler.register({
    name: 'tn:tps',
    description: '§6TPSを表示します',
    permissionLevel: CommandPermissionLevel.Any,
  }, () => {
    const tps = getTPS();
    return {
      status: CustomCommandStatus.Success,
      message: `Current TPS: ${getColor(tps)}${tps.toFixed(1)}/20.0`
    }
  }, {});
}

function getColor(tps) {
  if (tps >= 18) return '§a';
  if (tps >= 14) return '§e';
  if (tps >= 8) return '§6';
  return '§c';
}