import { ChatSendBeforeEvent, Player } from '@minecraft/server';
import { PlayerCommandOrigin, ScriptEventCommandOrigin, ServerCommandOrigin } from './CommandOrigin';

export interface CommandData {
  name: string;
  description: string;
  args?: string[];
  permission?: (player: Player) => boolean;
  func?: CommandCallback;
  disableScriptEvent?: boolean;
  aliases?: string[];
}

export type CommandCallback = (
  origin: PlayerCommandOrigin | ScriptEventCommandOrigin | ServerCommandOrigin,
  args: string[],
  manager: import('./CommandManager').CommandManager
) => void;

export interface PlayerCommandInput extends Partial<ChatSendBeforeEvent> {
  sender: Player;
  message: string;
}

export interface ServerCommandInput {
  message: string;
}