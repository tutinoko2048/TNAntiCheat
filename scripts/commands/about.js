import { VERSION, DISCORD_URL } from '../util/constants';

export default {
  name: 'about',
  description: 'このアドオンに関する情報を表示します',
  aliases: [ 'contact' ],
  func: (sender, args) => {
    sender.tell('-'.repeat(20));
    sender.tell(` §l§aTN-AntiCheat v${VERSION}§r `);
    sender.tell([
      'ScriptAPIを使った軽量で使いやすいアンチチートアドオンです\n',
      '- §eダウンロード:§r https://github.com/tutinoko2048/TNAntiCheat',
      `- §9Discordサポートサーバー:§r ${DISCORD_URL}`,
      '  §7(バグや§6bypass§7の報告・機能の提案などはこちらからどうぞ)§r',
      '- 開発者: tutinoko2048 / RetoRuto9900K',
      '- Twitter: @tutinoko_kusaa'
    ].join('\n'));
    sender.tell('-'.repeat(20));
  }
}