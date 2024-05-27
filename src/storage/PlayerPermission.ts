import { TABLES } from '@/database/tables';
import { Player } from '@minecraft/server';

export enum PlayerPermissionType {
  Member,
  Moderator,
  Admin
}

export enum PermissionFlags {
  Ban = 1 << 0,
  Kick = 1 << 1,
  TempKick = 1 << 2,
  Mute = 1 << 3,
  Freeze = 1 << 4,
  EditConfig = 1 << 5,
  ReceiveLogs = 1 << 6,
}

export class PlayerPermission {
  static get(player: Player): PlayerPermissionType {
    return TABLES.players.get(player.id)?.permission ?? PlayerPermissionType.Member;
  }

  static has(player: Player, permissionType: PlayerPermissionType): boolean {
    return this.get(player) === permissionType;
  }

  static hasFlag(player: Player, flag: PermissionFlags): boolean {
    const type = this.get(player);
    const flags = this.getDefaultFlags(type);
    return flags.includes(flag);
  }

  static set(player: Player, permissionType: PlayerPermissionType): void {
    const data = TABLES.players.get(player.id);
    if (data) {
      data.permission = permissionType;
      TABLES.players.set(player.id, data);
    }
  }

  static getDefaultFlags(permissionType: PlayerPermissionType): PermissionFlags[] {
    
  }

  static setDefaultFlags(permissionType: PlayerPermissionType, flags: PermissionFlags[]): void {}
}

export namespace PlayerPermission {
  export const Type = PlayerPermissionType;
  export const Flags = PermissionFlags;
}