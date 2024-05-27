import { DynamicDatabase } from './DynamicDatabase';

export const TABLES = {
  players: new DynamicDatabase('players'),
} as const satisfies Record<string, DynamicDatabase<any>>;