import * as mc from '@minecraft/server';
import { properties as PropertyKeys } from '../util/constants';

interface DynamicPropertyTypes {
  [PropertyKeys.ban]: boolean;
  [PropertyKeys.banReason]: string;
  [PropertyKeys.configData]: string;
  [PropertyKeys.mute]: boolean;
  [PropertyKeys.ownerId]: string;
}

declare module '@minecraft/server' {
  interface World {
    arrowSpawnCount?: number;
    cmdSpawnCount?: number;
    entityCheck?: any;
  }

  interface ItemStack {
    getComponent(componentId: 'minecraft:enchantments'): mc.ItemEnchantsComponent;
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

    getComponent(componentId: 'minecraft:inventory'): mc.EntityInventoryComponent;
    getComponent(componentId: 'minecraft:equipment_inventory'): mc.EntityEquipmentInventoryComponent;
    getComponent(componentId: 'minecraft:health'): mc.EntityHealthComponent;
    getComponent(componentId: 'minecraft:item'): mc.EntityItemComponent;
    getComponent(componentId: 'minecraft:variant'): mc.EntityVariantComponent;

    //getDynamicProperty<T extends keyof typeof PropertyKeys>(identifier: T): DynamicPropertyTypes[T];
  }

  interface Block {
    getComponent(componentId: 'minecraft:inventory'): mc.BlockInventoryComponent;
  }
}

export interface CommandInput {
  sender: mc.Player;
  message: string;
  cancel?: boolean;
}

export type CommandCallback = (sender: mc.Player, args: string[], manager: import('../managers/CommandManager').CommandManager) => void;

export interface ICommand {
  name: string;
  description: string;
  args?: string[];
  permission?: (player: mc.Player) => boolean;
  func?: CommandCallback;
  disableScriptEvent?: boolean;
  aliases?: string[];
}
