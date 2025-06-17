import { CustomCommandParamType, CustomCommandStatus } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { ModerationManager } from '../../util/ModerationManager';
import { Util } from '../../util/util';
import { AdminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:unban',
    description: '§aプレイヤーのBanを解除します',
    aliases: ['tn:pardon'],
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;

    const playerName = params.playerName;
    if (!playerName) return failure('プレイヤー名を指定してください');

    const queue = ModerationManager.getUnbanQueue();
    const existing = queue.find(entry => entry.name === playerName);
    
    if (existing) return failure(`${playerName} は既にunbanキューに存在します`);

    ModerationManager.addUnbanQueue(playerName);
    
    Util.writeLog({
      type: 'command.unban',
      message: `Added to unban queue by ${origin.getName()}`,
      playerName
    });

    return CustomCommandStatus.Success;
  }, {
    playerName: CustomCommandParamType.String,
  });
};
