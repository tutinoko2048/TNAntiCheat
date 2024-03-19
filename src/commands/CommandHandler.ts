import type { Main } from '@/main';
import { world, type ChatSendAfterEvent, Player } from '@minecraft/server';
import { ArgumentParserMap, type Command, CommandArgumentType } from './Command';
import { InvalidArgumentError, ParseContext } from './Parser';
import { _t } from '@/util/i18n';
import { registerCommands } from './register';

type GenericCommand = Command<Record<string, CommandArgumentType>>;

const prefix = '!';

interface IChatEvent {
  readonly sender: Player,
  readonly message: string,
  cancel?: boolean;
}

export class CommandHandler {
  public registeredCommands = new Map<string, GenericCommand>();

  constructor(public readonly main: Main) {
    world.afterEvents.chatSend.subscribe(this.onChatSend.bind(this));
  }

  public load() {
    const count = registerCommands(this);
    console.warn(`[TN-AntiCheat] Loaded ${count} commands`);
  }

  public onChatSend(event: ChatSendAfterEvent) {
    // TODO: convert to CommandOrigin
    if (event.message.startsWith(prefix)) this.handle(event);
  }

  handle(event: IChatEvent) {
    const { sender, message } = event;
    const [commandName, ...rawArgs] = message
      .slice(prefix.length)
      .trim()
      .split(/(?<!['"]\w+) +(?!\w+['"])/)
      .map(x => x.replace(/['"](.*)['"]/, '$1'));

    const command = this.registeredCommands.get(commandName) ?? [...this.registeredCommands.values()].find(c => c.options.aliases?.includes(commandName));
    if (!command) return sendTranslatedMessage(sender, 'commands.generic.unknown', [commandName]);

    event.cancel = true;

    const args = Object.entries(command.options.args);
    const parsedArgs: [string, any][] = [];
    try {
      const ctx: ParseContext = { index: 0, args: rawArgs }
      while (ctx.index < args.length) {
        const { parse } = ArgumentParserMap[args[ctx.index][1]];
        parsedArgs.push([args[ctx.index][0], parse(ctx)]);
        ctx.index++;
      }
      command.execute?.(sender, Object.fromEntries(parsedArgs), this.main);

    } catch (e) {
      if (e instanceof InvalidArgumentError) {
        sendTranslatedMessage(sender, 'commands.generic.syntax', [
          `${prefix}${command} ${args.slice(0, e.argumentIndex).join(' ')}`.slice(-9) + ' ',
          rawArgs[e.argumentIndex] ?? '',
          ' ' + `${args.slice(e.argumentIndex + 1).join(' ')}`.slice(0, 9)
        ]);
      } else {
        sender.sendMessage(_t('commands.error.unexpected', `${e}\n${e.stack}`));
      }
    }
  }

  register(command: GenericCommand) {
    this.registeredCommands.set(command.name, command);
  }
}

function sendTranslatedMessage(player: Player, langKey: string, args?: string[]) {
  player.sendMessage({
    rawtext: [{
      translate: langKey,
      with: args
    }]
  });
}