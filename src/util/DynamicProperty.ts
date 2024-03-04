import { Entity, world } from '@minecraft/server';

export interface DynamicPropertyTypeMap {
  generalConfig: string;
}

export class DynamicProperty {
  static get<K extends keyof DynamicPropertyTypeMap>(target: Entity | undefined, key: K): DynamicPropertyTypeMap[K] | undefined {
    return (target ?? world).getDynamicProperty(key) as any;
  }

  static set<K extends keyof DynamicPropertyTypeMap>(target: Entity | undefined, key: K, value: DynamicPropertyTypeMap[K] | undefined): void {
    (target ?? world).setDynamicProperty(key, value);
  }
}