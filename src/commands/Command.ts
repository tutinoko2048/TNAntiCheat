import type { Player } from '@minecraft/server';
import { type ArgumentParserMap, CommandArgumentType } from './Parser';
import type { Main } from '@/main';

export interface CommandOptions<ARGS> {
  description: string | (() => string);
  aliases?: string[];
  //permission?: (player: Player) => boolean,
  args: ARGS;
}

export class Command<ARGS extends Record<string, CommandArgumentType>> {
  constructor(
    public name: string,
    public options: CommandOptions<ARGS>,
    public execute?: (
      origin: Player,
      args: {
        [key in keyof ARGS]: ReturnType<(ArgumentParserMap)[ARGS[key]]>
      },
      main: Main
    ) => void
  ) {}
}
