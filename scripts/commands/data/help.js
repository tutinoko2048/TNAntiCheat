import { CommandPermissionLevel } from '@minecraft/server';
import { commandHandler, failure, success } from '../../lib/exports';
import { VERSION } from '../../util/constants';

export default () => {
  commandHandler.register({
    name: 'tn:help',
    description: '§6このアドオンで使用可能なコマンドの一覧を表示します',
    permissionLevel: CommandPermissionLevel.Any,
  }, (_, origin) => {
    if (!origin.isSendable()) return failure('このコマンドはここでは実行できません');

    let permissionLevel = CommandPermissionLevel.Any;

    const player = origin.getPlayer();
    if (origin.isServer()) permissionLevel = CommandPermissionLevel.Owner;
    else if (player) permissionLevel = player.commandPermissionLevel;

    const message = [
      '-'.repeat(20),
      `§lTN-AntiCheat v${VERSION}§r`,
      ' ',
      '§7使用可能なコマンド一覧:',
      ...commandHandler.getAvailableCommands(permissionLevel).map(c => (
        `  /${c.name} - ${c.description}`
      )),
      '-'.repeat(20),
    ].join('§r\n');
    return success(message);
  }, {});
}
