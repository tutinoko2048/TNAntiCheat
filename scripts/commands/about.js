import { VERSION, DISCORD_URL } from '../util/constants';
import { Command } from '../util/Command';

const aboutCommand = new Command({
  name: 'about',
  description: 'このアドオンに関する情報を表示します',
  aliases: [ 'contact' ],
  args: [ '' ]
}, (origin) => {
  origin.send('-'.repeat(20));
  origin.send(`§l§aTN-AntiCheat v${VERSION}§r`);
  origin.send([
    'ScriptAPIを使った軽量で使いやすいアンチチートアドオンです\n',
    '- ダウンロード:§r https://github.com/tutinoko2048/TNAntiCheat',
    `- §9Discordサポートサーバー:§r ${DISCORD_URL}`,
    '  §7(バグや§6bypass§7の報告・機能の提案などはこちらからどうぞ)§r',
    '- Developer: tutinoko2048 / RetoRuto9900K'
  ].join('\n'));
  origin.send('-'.repeat(20));
});

export default aboutCommand;