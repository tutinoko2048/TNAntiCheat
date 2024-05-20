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
  has(player: Player, permissionType: PlayerPermissionType): boolean {}

  hasFlag(player: Player, flag: PermissionFlags): boolean {}

  set(player: Player, permissionType: PlayerPermissionType): void {}

  setPermissionTypeFlags(permissionType: PlayerPermissionType, flags: PermissionFlags[]): void {}
}
