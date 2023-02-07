import { DISCORD_URL } from '../util/constants';
import { CommandError } from '../util/CommandError';

export default {
  name: 'help',
  description: 'ヘルプを表示します。 !help <コマンド名> でコマンドの詳細な説明を表示します',
  args: [ '', '[command: commandName]' ],
  aliases: [ 'herp', 'herupu', 'helupu' ],
  func: (sender, args, manager) => {
    const [ commandName ] = args;
    const available = manager.getAll().filter(c => !c.permission || c.permission(sender));
    if (commandName) {
      const command = available.find(c => c.name === commandName);
      if (!command) throw new CommandError(`コマンド ${commandName} が見つかりませんでした`);
      sender.tell(`§e${command.name}: ${command.description}`);
      if (command.aliases?.length > 0) sender.tell(`aliases: ${command.aliases.map(x => `${manager.prefix}${x}`).join(', ')}`);
      sender.tell('使い方:');
      sender.tell(command.args?.map(v => `- ${manager.prefix}${command.name} ${v}`).join('\n'));
    } else {
      sender.tell('-'.repeat(20));
      sender.tell('§a=== TN-AntiCheat ===§r');
      sender.tell([
        '§lCommands:§r',
        ...available.map(c => `  §6${manager.prefix}${c.name}§r - ${c.description || ''}`),
        '§7!help <コマンド名> でコマンドの詳細な説明を表示します',
        '§l§9Discord Support:§r',
        `  ${DISCORD_URL}`
      ].join('\n'));
      sender.tell('-'.repeat(20));
    }
    
  }
}