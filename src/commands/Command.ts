import type { Player } from '@minecraft/server';
import { NumberArgument, StringArgument, Vector3Argument } from './Parser';
import type { Main } from '@/main';

export enum CommandArgumentType {
  String,
  Number,
  Vector3
}

export const ArgumentParserMap = {
  [CommandArgumentType.String]: StringArgument,
  [CommandArgumentType.Number]: NumberArgument,
  [CommandArgumentType.Vector3]: Vector3Argument
}

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
        [key in keyof ARGS]: ReturnType<(typeof ArgumentParserMap)[ARGS[key]]['parse']>
      },
      main: Main
    ) => void
  ) {}
}
