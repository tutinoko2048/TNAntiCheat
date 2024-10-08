import * as mc from '@minecraft/server';

interface IModule {
  state?: boolean;
  punishment?: import('../util/util').PunishmentType;
  flagCount?: number;
  [key: string]: any;
}

interface EntityCounterModule extends IModule {
  detect: Record<string, number>
}

interface CreativeModule extends IModule {
  defaultGamemode: mc.GameMode[keyof mc.GameMode];
}

interface ItemListModule {
  ban: string[];
  kick: string[];
  notify: string[];
}

interface ItemCheckDModule extends IModule {
  mode: 'hand' | 'inventory';
}

interface OthersModule {
  [key: string]: any;
  tpsToScore: {
    enabled: boolean;
    updateInterval: number;
    objective: string;
    name: string;
  },
  customKickMessage: string;
}

interface SpammerModule extends IModule {
  autoMuteCount: number;
  tempMute: boolean;
}

interface ScaffoldModule extends IModule {
  A: boolean;
  B: boolean;
  C: boolean;
  D: boolean;
  E: boolean;
  F: boolean;
  G: boolean;
  H: boolean;
  minBPS: number;
  yDiff: number;
  dDiff: number;
  minSpeed: number;
}

interface PermissionRole {
  encrypt: boolean;
  tag: string;
  players: string[];
  ids: string[];
}

interface PermissionModule {
  admin: PermissionRole;
  builder: PermissionRole;
  ban: PermissionRole & { xuids: string[] };
}

export type IConfig = {
  permission: PermissionModule;
  command: {
    prefix: string;
    enableConsole: boolean;
  };
  itemList: ItemListModule;
  nuker: IModule;
  namespoof: IModule;
  spammerA: SpammerModule;
  spammerB: SpammerModule;
  spammerC: SpammerModule;
  instaBreak: IModule;
  itemCheckA: IModule;
  itemCheckB: IModule;
  itemCheckC: IModule;
  itemCheckD: ItemCheckDModule;
  itemCheckE: IModule;
  placeCheckA: IModule;
  placeCheckB: IModule;
  placeCheckC: IModule;
  placeCheckD: IModule;
  entityCheckA: IModule;
  entityCheckB: IModule;
  entityCheckC: IModule;
  entityCheckD: IModule;
  entityCounter: EntityCounterModule;
  reachA: IModule;
  reachB: IModule;
  reachC: IModule;
  autoClicker: IModule;
  creative: CreativeModule;
  speedA: IModule;
  flyA: IModule;
  scaffold: ScaffoldModule;
  logger: {
    console: boolean;
    maxLogs: number;
    shortName: boolean;
    sendws: boolean;
    emitScriptEvent: string;
  };
  others: OthersModule;
  // [moduleName: string]: IModule;
}