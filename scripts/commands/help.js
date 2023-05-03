import { DISCORD_URL } from '../util/constants';
import { CommandError } from '../util/CommandError';
import { Command } from '../util/Command';

const helpCommand = new Command({
  name: 'help',
  description: 'ヘルプを表示します。 !help <コマンド名> でコマンドの詳細な説明を表示します',
  args: [ '', '[command: commandName]' ],
  aliases: [ 'herp', 'herupu', 'helupu' ]
}, (sender, args, manager) => {
  const [ commandName ] = args;
  const available = manager.getAll().filter(c => !c.permission || c.permission(sender));
  if (commandName) {
    const command = available.find(c => c.name === commandName);
    if (!command) throw new CommandError(`コマンド ${commandName} が見つかりませんでした`);
    sender.sendMessage(`§e${command.name}: ${command.description}`);
    if (command.aliases?.length > 0) sender.sendMessage(`aliases: ${command.aliases.map(x => `${manager.prefix}${x}`).join(', ')}`);
    sender.sendMessage('使い方:');
    sender.sendMessage(command.args?.map(v => `- ${manager.prefix}${command.name} ${v}`).join('\n'));
  } else {
    sender.sendMessage('-'.repeat(20));
    sender.sendMessage('§a=== TN-AntiCheat ===§r');
    sender.sendMessage([
      '§lCommands:§r',
      ...available.map(c => `  §6${manager.prefix}${c.name}§r - ${c.description || ''}`),
      '§7!help <コマンド名> でコマンドの詳細な説明を表示します',
      '§l§9Discord Support:§r',
      `  ${DISCORD_URL}`
    ].join('\n'));
    sender.sendMessage('-'.repeat(20));
  }
});

export default helpCommand;