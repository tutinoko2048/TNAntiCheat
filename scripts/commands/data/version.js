import { VERSION } from '../../util/constants';
import { CommandPermissionLevel, CustomCommandStatus } from '@minecraft/server';
import { commandHandler } from '../../lib/exports';

export default () => {
  commandHandler.register({
    name: 'tn:version',
    description: 'アドオンのバージョンを表示します',
    permission: CommandPermissionLevel.Any,
  }, () => {
    return {
      status: CustomCommandStatus.Success,
      message: `This world is running TN-AntiCheat v${VERSION}§r`
    }
  }, {});
}