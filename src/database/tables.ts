import { type PlayerDataEntry } from '@/storage/PlayerData';
import { DynamicDatabase } from './DynamicDatabase';

export const TABLES = {
  players: new DynamicDatabase<PlayerDataEntry>('players'),
} as const satisfies Record<string, DynamicDatabase<any>>;