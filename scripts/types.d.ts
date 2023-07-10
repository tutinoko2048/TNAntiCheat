import * as mc from '@minecraft/server';
import { PropertyIds } from './util/constants';

interface DynamicPropertyTypes {
  [PropertyIds.ban]: boolean;
  [PropertyIds.banReason]: string;
  [PropertyIds.configData]: string;
  [PropertyIds.mute]: boolean;
  [PropertyIds.ownerId]: string;
}

interface EntityComponentTypes {
  'minecraft:inventory': mc.EntityInventoryComponent;
  'minecraft:equipment_inventory': mc.EntityEquipmentInventoryComponent;
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

declare module '@minecraft/server' {
  interface World {
    arrowSpawnCount?: number;
    cmdSpawnCount?: number;
    entityCheck?: any;
    logs?: ActionLog[];
    
    getDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T): DynamicPropertyTypes[T];
  }

  interface Entity {
    lastHitAt?: number;
    threwTridentAt?: number;
    dimensionSwitchedAt?: number;
    joinedAt?: number;
    lastLocation?: mc.Vector3;
    lastDimensionId?: string;
    lastVelocity?: number;
    lastMsg?: string;
    lastMsgSentAt?: number;
    isMoved?: boolean;
    speedACount?: number;
    placeBCount?: number;
    breakCount?: number;
    cps?: number[];
    autoClickerFlag?: string;
    reachAFlag?: string;
    reachBFlag?: string;
    reachCFlag?: string;
    flagQueue?: string;
    
    getComponent<K extends keyof EntityComponentTypes>(componentId: K): EntityComponentTypes[K];

    getDynamicProperty<T extends keyof DynamicPropertyTypes>(identifier: T): DynamicPropertyTypes[T];
  }

  interface Block {
    getComponent<K extends keyof BlockComponentTypes>(componentId: K): BlockComponentTypes[K];
  }
  
  interface ItemStack {
    getComponent<K extends keyof ItemComponentTypes>(componentId: K): ItemComponentTypes[K];
  }
}

export interface CommandInput {
  sender: mc.Player;
  message: string;
  cancel?: boolean;
}

export type CommandCallback = (sender: mc.Player, args: string[], manager: import('./managers/CommandManager').CommandManager) => void;

export interface CommandData {
  name: string;
  description: string;
  args?: string[];
  permission?: (player: mc.Player) => boolean;
  func?: CommandCallback;
  disableScriptEvent?: boolean;
  aliases?: string[];
}

export interface ActionLog {
  createdAt?: number;
  playerName?: string;
  playerId?: string;
  'type': string;
  punishment?: string;
  message?: string;
}