import { CustomCommandStatus } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import config from '../../config.js';
import { adminPermission } from '../utils';

export default () => {
  commandHandler.register({
    name: 'tn:module',
    description: 'モジュール一覧を表示します',
    permission: adminPermission,
  }, (_, origin) => {
    if (!origin.isSendable()) return failure('このコマンドはここでは実行できません');

    const modules = Object.keys(config).filter(key => isObject(config[key]) && 'state' in config[key]);
    return {
      status: CustomCommandStatus.Success,
      message: [
        '§lModules',
        ...modules.map(m => `- ${m}: ${config[m].state ? '§o§aEnabled§r' : '§o§cDisabled§r'}`),
      ].join('\n')
    };
  }, {});
}

function isObject(item) {
  return typeof item === 'object' && item !== null;
}