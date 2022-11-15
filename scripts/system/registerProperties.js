import { world, DynamicPropertiesDefinition, MinecraftEntityTypes } from '@minecraft/server';
import { properties } from '../util/constants';

const def = new DynamicPropertiesDefinition();
def.defineBoolean(properties.ban);
def.defineString(properties.banReason, 100);
def.defineBoolean(properties.mute);

const def2 = new DynamicPropertiesDefinition();
def2.defineString(properties.configData, 5900);
def2.defineString(properties.chatFilter, 4000);

world.events.worldInitialize.subscribe(ev => {
  ev.propertyRegistry.registerEntityTypeDynamicProperties(def, MinecraftEntityTypes.player);
  ev.propertyRegistry.registerWorldDynamicProperties(def2);
});