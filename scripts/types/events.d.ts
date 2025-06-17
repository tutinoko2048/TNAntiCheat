import { PermissionType } from '../util/Permissions';
import { PunishmentType } from '../util/util';

export interface ConfigUpdateEvent {
  key: string;
  oldValue: any;
  newValue: any;
}

export interface PlayerPermissionAddEvent {
  player: Player;
  permission: PermissionType;
}

export interface PlayerPermissionRemoveEvent {
  player: Player;
  permission: PermissionType;
}

export interface PlayerTempkickEvent {
  player: Player;
}

export interface PlayerKickEvent extends PlayerTempkickEvent {
  reason: string;
}

export interface PlayerBanEvent extends PlayerKickEvent {
  expireAt?: number;
}

export interface PlayerUnbanAddEvent {
  playerName: string;
}

export interface PlayerUnbanRemoveEvent {
  playerName: string;
}

export interface PlayerUnbanSuccessEvent {
  player: Player;
}

export interface PlayerMuteUpdateEvent {
  player: Player;
  currentValue: boolean;
  isTemporary: boolean;
}

export interface PlayerFreezeUpdateEvent {
  player: Player;
  currentValue: boolean;
}

export interface PlayerFlaggedEvent {
  player: Player;
  type: string;
  punishment: PunishmentType;
  message: string;
}