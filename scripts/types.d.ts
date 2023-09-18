import * as mc from '@minecraft/server';
import { PropertyIds } from './util/constants';

interface DynamicPropertyTypes {
  [PropertyIds.ban]: boolean;
  [PropertyIds.banReason]: string;
  //[PropertyIds.banExpireAt]: number;
  [PropertyIds.configData]: string;
  [PropertyIds.mute]: boolean;
  [PropertyIds.ownerId]: string;
  [PropertyIds.unbanQueue]: string;
}

interface EntityComponentTypes {
  'minecraft:inventory': mc.EntityInventoryComponent;
  'minecraft:equippable': mc.EntityEquippableComponent;
  'minecraft:health': mc.EntityHealthComponent;
  'minecraft:variant': mc.EntityVariantComponent;
  'minecraft:item': mc.EntityItemComponent;
}

interface BlockComponentTypes {
  'minecraft:inventory': mc.BlockInventoryComponent;
}

interface ItemComponentTypes {
  'minecraft:enchantments': mc.ItemEnchantsComponent;
}

interface EntityCheckEntry {
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

    reachAFlag?: string;
    reachBFlag?: string;
    reachCFlag?: string;
    flagQueue?: string;
    
    getComponent<K extends keyof EntityComponentTypes>(componentId: K): EntityComponentTypes[K];

    getDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T): DynamicPropertyTypes[T];
    setDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T, value: DynamicPropertyTypes[T]): void;
  }

  interface Block {
    getComponent<K extends keyof BlockComponentTypes>(componentId: K): BlockComponentTypes[K];
  }
  
  interface ItemStack {
    getComponent<K extends keyof ItemComponentTypes>(componentId: K): ItemComponentTypes[K];
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
  //expireAt?: number;
  /** kick時に表示するメッセージ(理由) */
  message: string;
}

export interface UnbanQueueEntry {
  name: string;
  source: 'property' | 'file';
}

export interface IConfig {
  [moduleName: string]: IModule;
}

export interface IModule {
  [key: string]: any;
  state?: boolean;
  punishment?: import('./util/util').PunishmentType;
}