import { ItemStopUseOnEventSignal_deprecated } from "@minecraft/server";

declare module '@minecraft/server' {
  interface World {
    arrowSpawnCount?: number;
    cmdSpawnCount?: number;
    entityCheck?: any;
  }

  interface Entity {
    lastHitAt?: number;
    threwTridentAt?: number;
    dimensionSwitchedAt?: number;
    lastLocation?: import('@minecraft/server').Vector3;
    lastDimensionId?: string;
    isMoved?: boolean;
    breakCount?: number;
    cps?: number[];
    autoClickerFlag?: string;
    reachAFlag?: string;
    reachBFlag?: string;
  }
}