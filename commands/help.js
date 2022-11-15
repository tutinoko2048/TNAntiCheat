import { discord } from '../util/constants';
import { CommandError } from '../util/CommandError';

export const help = {
  name: 'help',
  description: 'ヘルプを表示します。 /help <コマンド名> でコマンドの詳細な説明を表示します',
  args: [ '', '[command: commandName]' ],
  aliases: [ 'herupu', 'helupu' ],
  func: (sender, args, handler) => {
    const [ commandName ] = args;
    const available = handler.getAll().filter(c => !c.permission || c.permission(sender));
    if (commandName) {
      const command = available.find(c => c.name === commandName);
      if (!command) throw new CommandError(`コマンド ${commandName} が見つかりませんでした`);
      sender.tell(`§e${command.name}: ${command.description}`);
      sender.tell('使い方:');
      sender.tell(command.args?.map(v => `- ${handler.prefix}${command.name} ${v}`).join('\n'));
    } else {
      sender.tell('-'.repeat(20));
      sender.tell('§aTN-AntiCheat Help§r');
      sender.tell([
        '\n§lCommands:§r',
        ...available.map(c => `  §6${handler.prefix}${c.name}§r - ${c.description || ''}`),
        '\n§l§bDiscord Support:§r',
        `  ${discord}`
      ].join('\n'));
      sender.tell('-'.repeat(20));
    }
    
  }
}