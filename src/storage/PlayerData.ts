import { TABLES } from '@/database/tables';
import { type PlayerPermissionType } from '@/storage/PlayerPermission';

/** Represents the data entry for saving in the database.　*/
export interface PlayerDataEntry {
  name: string;
  permission: PlayerPermissionType;
}

export type PlayerData = PlayerDataEntry & { id: string };

/**
 * Provides methods for accessing player data from the database.
 */
export class PlayerStorage {
  /**
   * Retrieves player data by name.
   * @param name - The name of the player.
   * @returns The player data with the matching name, or `undefined` if not found.
   */
  static getByName(name: string): PlayerData | undefined {
    for (const [id, data] of TABLES.players.entries()) {
      if (data.name === name) {
        return { ...data, id };
      }
    }
  }

  static getById(id: string): PlayerData | undefined {
    const data = TABLES.players.get(id);
    if (data) {
      return { ...data, id };
    }
  }
}