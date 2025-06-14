import { CommandPermissionLevel, CustomCommandStatus } from '@minecraft/server';
import { commandHandler, failure } from '../../lib/exports';
import { VERSION, DISCORD_URL } from '../../util/constants';

export default () => {
  commandHandler.register({
    name: 'tn:about',
    description: 'このアドオンに関する情報を表示します',
    permission: CommandPermissionLevel.Any,
  }, (_, origin) => {
    if (!origin.isSendable()) return failure('このコマンドはここでは実行できません');
    
    origin.sendMessage('-'.repeat(20));
    origin.sendMessage(`§l§aTN-AntiCheat v${VERSION}§r`);
    origin.sendMessage([
      'ScriptAPIを使った軽量で使いやすいアンチチートアドオンです\n',
      '- ダウンロード:§r https://github.com/tutinoko2048/TNAntiCheat',
      `- §9Discordサポートサーバー:§r ${DISCORD_URL}`,
      '  §7(バグや§6bypass§7の報告・機能の提案などはこちらからどうぞ)§r',
      '- Developer: tutinoko2048 / RetoRuto9900K'
    ].join('\n'));
    origin.sendMessage('-'.repeat(20));

    return CustomCommandStatus.Success;
  }, {});
}
