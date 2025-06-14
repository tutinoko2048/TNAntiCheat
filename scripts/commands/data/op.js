import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, Player, PlayerPermissionLevel, system } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { Util } from '../../util/util';
import { PermissionType, Permissions } from '../../util/Permissions';

export default () => {
  commandHandler.register({
    name: 'tn:op',
    description: '§aTN-AntiCheatの管理者権限を付与します',
    permission: {
      permissionLevel: CommandPermissionLevel.Admin,
      onVerify: (origin) => {
        return origin.isServer() || origin.getPlayer()?.playerPermissionLevel === PlayerPermissionLevel.Operator;
      }
    },
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

    // if (!target.isOp() && !config.others.fixBDS) return failure(`プレイヤー ${target.name} の権限が不足しています`);
    if (Util.isOP(target)) return failure(`${target.name} は既に権限を持っています`);

    system.run(() => {
      Permissions.add(target, PermissionType.Admin);
      Util.notify(`§7${origin.getName()} >> ${target.name} に管理者権限を与えました`);
      Util.writeLog({ type: 'command.op', message: `Executed by ${origin.getName()}` }, target);
    });

    return CustomCommandStatus.Success;
  }, {
    target: [CustomCommandParamType.PlayerSelector],
  });
};