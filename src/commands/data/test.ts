import { Command, CommandArgumentType } from '../Command';
  
const help = new Command('test', {
  description: 'description',
  aliases: ['tes'],
  args: {
    aiueo: CommandArgumentType.String,
    hello: CommandArgumentType.Number,
    location: CommandArgumentType.Vector3
  }
}, (origin, args) => {
  origin.sendMessage(JSON.stringify(args));
});

export default help;
