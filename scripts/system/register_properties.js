import { world, DynamicPropertiesDefinition, MinecraftEntityTypes } from '@minecraft/server';
import { properties } from '../util/constants';

const def = new DynamicPropertiesDefinition(); // player
def.defineBoolean(properties.ban);
def.defineString(properties.banReason, 50);
def.defineBoolean(properties.mute);

const def2 = new DynamicPropertiesDefinition(); // world
def2.defineString(properties.configData, 7000);
def2.defineString(properties.ownerId, 30);

world.afterEvents.worldInitialize.subscribe(({ propertyRegistry }) => {
  propertyRegistry.registerEntityTypeDynamicProperties(def, MinecraftEntityTypes.player);
  propertyRegistry.registerWorldDynamicProperties(def2);
});