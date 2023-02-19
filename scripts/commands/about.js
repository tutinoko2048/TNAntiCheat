import { VERSION, DISCORD_URL } from '../util/constants';

export default {
  name: 'about',
  description: 'このアドオンに関する情報を表示します',
  aliases: [ 'contact' ],
  args: [ '' ],
  func: (sender, args) => {
    sender.sendMessage('-'.repeat(20));
    sender.sendMessage(`§l§aTN-AntiCheat v${VERSION}§r`);
    sender.sendMessage([
      'ScriptAPIを使った軽量で使いやすいアンチチートアドオンです\n',
      '- ダウンロード:§r https://github.com/tutinoko2048/TNAntiCheat',
      `- §9Discordサポートサーバー:§r ${DISCORD_URL}`,
      '  §7(バグや§6bypass§7の報告・機能の提案などはこちらからどうぞ)§r',
      '- Developer: tutinoko2048 / RetoRuto9900K'
    ].join('\n'));
    sender.sendMessage('-'.repeat(20));
  }
}