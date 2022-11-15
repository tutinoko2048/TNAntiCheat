import { version, discord } from '../util/constants';

export const about = {
  name: 'about',
  description: 'このアドオンに関する情報を表示します',
  aliases: [ 'contact' ],
  func: (sender, args, handler) => {
    sender.tell('-'.repeat(20));
    sender.tell(` §l§aTN-AntiCheat v${version}§r `);
    sender.tell([
      'ScriptAPIを使った軽量で使いやすいアンチチートアドオンです\n',
      '- §eダウンロード:§r https://github.com/tutinoko2048/TNAntiCheat',
      `- §9Discordサポートサーバー:§r ${discord}`,
      '  §7(バグや§6bypass§7の報告・機能の提案などはこちらからどうぞ)§r',
      '- 開発者: tutinoko2048 / RetoRuto9900K',
      '- Twitter: @tutinoko_kusaa'
    ].join('\n'));
    sender.tell('-'.repeat(20))
  }
}