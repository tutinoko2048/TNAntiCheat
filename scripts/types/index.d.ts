import * as mc from '@minecraft/server';
import { PropertyIds } from '../util/constants';

export * from './Config'

interface DynamicPropertyTypes {
  [PropertyIds.ban]: boolean;
  [PropertyIds.banReason]: string;
  [PropertyIds.banExpireAt]: number;
  [PropertyIds.configData]: string;
  [PropertyIds.mute]: boolean;
  [PropertyIds.ownerId]: string;
  [PropertyIds.unbanQueue]: string;
  [PropertyIds.isRegistered]: boolean;
}

export interface EntityCheckEntry {
  typeId: string;
  item?: string;
  x: number;
  y: number;
  z: number;
  count?: number;
}

declare module '@minecraft/server' {
  interface World {
    arrowSpawnCount?: number;
    cmdSpawnCount?: number;
    entityCheck?: Record<string, EntityCheckEntry>;
    logs?: ActionLog[];
    
    getDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T): DynamicPropertyTypes[T];
    setDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T, value: DynamicPropertyTypes[T]): void;
  }

  interface Entity {
    // data
    threwTridentAt?: number;
    pistonPushedAt?: number;
    dimensionSwitchedAt?: number;
    joinedAt?: number;
    lastLocation?: mc.Vector3;
    lastDimensionId?: string;
    lastVelocity?: number;
    lastMsg?: string;
    lastMsgSentAt?: number;
    isMoved?: boolean;
    clicks?: number[];
    breakCount?: number;
    /** 前のtickで飛んでたかどうか */
    wasGliding?: boolean;
    /** エリトラの使用をやめた時刻 */
    stopGlideAt?: number;

    // punishment counts
    speedACount?: number;
    flyACount?: number;
    placeBCount?: number;
    autoClickerCount?: number;
    spammerACount?: number;
    spammerBCount?: number;
    spammerCCount?: number;
    reachACount?: number;
    reachBCount?: number;
    reachCCount?: number;

    flagQueue?: string;

    getDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T): DynamicPropertyTypes[T];
    setDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T, value: DynamicPropertyTypes[T]): void;
  }
}

export interface ActionLog {
  createdAt?: number;
  playerName?: string;
  playerId?: string;
  'type': string;
  punishment?: string;
  message?: string;
}

export interface BanOptions {
  /** 保存されて今後表示されるbanの理由 */
  reason?: string;
  /** banする期間(ms) */
  expireAt?: number;
  /** kick時に表示するメッセージ(理由) */
  message: string;
  /** @default true */
  forceKick?: boolean;
}

export interface UnbanQueueEntry {
  name: string;
  source: 'property' | 'file';
}
