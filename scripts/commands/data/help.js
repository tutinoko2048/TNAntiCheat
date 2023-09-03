import { DISCORD_URL } from '../../util/constants';
import { CommandError } from '../../util/CommandError';
import { Command } from '../../util/Command';

const helpCommand = new Command({
  name: 'help',
  description: 'ヘルプを表示します。 !help <コマンド名> でコマンドの詳細な説明を表示します',
  args: [ '', '[command: commandName]' ],
  aliases: [ 'herp', 'herupu', 'helupu' ]
}, (origin, args, manager) => {
  const [ commandName ] = args;
  const available = manager.getAll().filter(c => {
    return origin.isPlayerOrigin()
      ? (!c.permission || c.permission(origin.sender))
      : origin.isServerOrigin();
  });
  if (commandName) {
    const command = available.find(c => c.name === commandName);
    if (!command) throw new CommandError(`コマンド ${commandName} が見つかりませんでした`);
    origin.send(`§e${command.name}: ${command.description}`);
    if (command.aliases?.length > 0) origin.send(`aliases: ${command.aliases.map(x => `${manager.prefix}${x}`).join(', ')}`);
    origin.send('使い方:');
    origin.send(command.args?.map(v => `- ${manager.prefix}${command.name} ${v}`).join('\n'));
  } else {
    origin.send('-'.repeat(20));
    origin.send('§a=== TN-AntiCheat ===§r');
    origin.send([
      '§lCommands:§r',
      ...available.map(c => `  §6${manager.prefix}${c.name}§r - ${c.description || ''}`),
      '§7!help <コマンド名> でコマンドの詳細な説明を表示します',
      '§l§9Discord Support:§r',
      `  ${DISCORD_URL}`
    ].join('\n'));
    origin.send('-'.repeat(20));
  }
});

export default helpCommand;