import { world, DynamicPropertiesDefinition } from '@minecraft/server';
import { PropertyIds } from '../util/constants';

const def = new DynamicPropertiesDefinition(); // player
def.defineBoolean(PropertyIds.ban);
def.defineString(PropertyIds.banReason, 50);
def.defineString(PropertyIds.banExpireAt, 15);
def.defineBoolean(PropertyIds.mute);

const def2 = new DynamicPropertiesDefinition(); // world
def2.defineString(PropertyIds.configData, 7000);
def2.defineString(PropertyIds.ownerId, 30);
def2.defineString(PropertyIds.unbanQueue, 1000);

world.afterEvents.worldInitialize.subscribe(({ propertyRegistry }) => {
  propertyRegistry.registerEntityTypeDynamicProperties(def, 'minecraft:player');
  propertyRegistry.registerWorldDynamicProperties(def2);
});