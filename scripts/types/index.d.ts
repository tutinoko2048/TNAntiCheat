import * as mc from '@minecraft/server';

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