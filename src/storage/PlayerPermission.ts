import { TABLES } from '@/database/tables';
import { DynamicProperty } from '@/utils/DynamicProperty';
import { type Player } from '@minecraft/server';

export enum PlayerPermissionType {
  Member,
  Moderator,
  Admin
}

export const PermissionFlags = {
  Ban: 1 << 0,
  Kick: 1 << 1,
  TempKick: 1 << 2,
  Mute: 1 << 3,
  Freeze: 1 << 4,
  EditConfig: 1 << 5,
  ReceiveLogs: 1 << 6,
} as const;
export type PermissionFlags = typeof PermissionFlags[keyof typeof PermissionFlags];

const PermissionPropertyKeyMap = {
  [PlayerPermissionType.Member]: 'memberPermission',
  [PlayerPermissionType.Moderator]: 'moderatorPermission',
  [PlayerPermissionType.Admin]: 'adminPermission',
} as const;

export class PlayerPermission {
  static get(player: Player): PlayerPermissionType {
    return TABLES.players.get(player.id)?.permission ?? PlayerPermissionType.Member;
  }

  static set(player: Player, permissionType: PlayerPermissionType): void {
    const data = TABLES.players.get(player.id);
    if (data) {
      data.permission = permissionType;
      TABLES.players.set(player.id, data);
    }
  }

  static has(player: Player, permissionType: PlayerPermissionType): boolean {
    return this.get(player) === permissionType;
  }

  static hasFlag(player: Player, flag: PermissionFlags): boolean {
    const type = this.get(player);
    const flags = this.getDefaultFlags(type);
    return flags.includes(flag);
  }

  static getDefaultFlags(permissionType: PlayerPermissionType): PermissionFlags[] {
    const key = PermissionPropertyKeyMap[permissionType];
    const bits = DynamicProperty.get(undefined, key) ?? 0;
    return Object.values(PermissionFlags).filter(flag => (bits & flag) === flag);
  }

  static setDefaultFlags(permissionType: PlayerPermissionType, flags: PermissionFlags[]): void {
    const key = PermissionPropertyKeyMap[permissionType];
    const bits = flags.reduce((acc, flag) => acc | flag, 0);
    DynamicProperty.set(undefined, key, bits);
  }
}

export namespace PlayerPermission {
  export const Type = PlayerPermissionType;
  export const Flags = PermissionFlags;
}