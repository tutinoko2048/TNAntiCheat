import * as mc from '@minecraft/server';
import { PropertyIds } from './util/constants';
import { PlayerCommandOrigin, ScriptEventCommandOrigin, ServerCommandOrigin } from './commands/CommandOrigin';

interface DynamicPropertyTypes {
  [PropertyIds.ban]: boolean;
  [PropertyIds.banReason]: string;
  //[PropertyIds.banExpireAt]: string;
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
    
    // punishment counts
    speedACount?: number;
    flyACount?: number;
    placeBCount?: number;
    
    breakCount?: number;
    clicks?: number[];

    autoClickerFlag?: string;
    reachAFlag?: string;
    reachBFlag?: string;
    reachCFlag?: string;
    flagQueue?: string;
    
    /** 前のtickで飛んでたかどうか */
    wasGliding?: boolean;
    /** エリトラの使用をやめた時刻 */
    stopGlideAt?: number;
    
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

export interface PlayerCommandInput extends Partial<mc.ChatSendBeforeEvent> {
  sender: mc.Player;
  message: string;
}

export interface ServerCommandInput {
  message: string;
}

export type CommandCallback = (
  origin: PlayerCommandOrigin | ScriptEventCommandOrigin | ServerCommandOrigin,
  args: string[],
  manager: import('./commands/CommandManager').CommandManager
) => void;

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