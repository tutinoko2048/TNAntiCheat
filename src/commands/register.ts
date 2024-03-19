import type { CommandHandler } from './CommandHandler';
import test from './data/test';

const COMMANDS = [
  test
]

export function registerCommands(handler: CommandHandler): number {
  for (const cmd of COMMANDS) {
    handler.register(cmd);
  }
  return COMMANDS.length;
}
