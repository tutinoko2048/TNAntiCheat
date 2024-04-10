import { Command } from '../Command';
import { CommandArgumentType } from '../Parser';
  
const help = new Command('test', {
  description: 'description',
  aliases: ['tes'],
  args: {
    aiueo: CommandArgumentType.String,
    hello: CommandArgumentType.Int,
    location: CommandArgumentType.Vector3
  }
}, (origin, args) => {
  origin.sendMessage(JSON.stringify(args));
});

export default help;
