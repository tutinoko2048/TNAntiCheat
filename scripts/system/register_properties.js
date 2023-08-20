import { world, DynamicPropertiesDefinition, MinecraftEntityTypes } from '@minecraft/server';
import { PropertyIds } from '../util/constants';

const def = new DynamicPropertiesDefinition(); // player
def.defineBoolean(PropertyIds.ban);
def.defineString(PropertyIds.banReason, 50);
def.defineBoolean(PropertyIds.mute);

const def2 = new DynamicPropertiesDefinition(); // world
def2.defineString(PropertyIds.configData, 7000);
def2.defineString(PropertyIds.ownerId, 30);
def2.defineString(PropertyIds.unbanQueue, 1000);

world.afterEvents.worldInitialize.subscribe(({ propertyRegistry }) => {
  propertyRegistry.registerEntityTypeDynamicProperties(def, MinecraftEntityTypes.player);
  propertyRegistry.registerWorldDynamicProperties(def2);
});