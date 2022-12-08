import { world, Player } from '@minecraft/server';
import { TNAntiCheat } from './ac';
import { events } from './lib/events/index';
import { properties } from './util/constants';
import { Permissions } from './util/Permissions';
import './lib/timer.js';
import './system/dog.js';
import './system/register_properties.js';
import './system/polyfill.js';

const ac = new TNAntiCheat();
events.worldLoad.subscribe(() => {
  if (world.getDynamicProperty(properties.ownerId)) {
    ac.enable();
  } else {
    world.say('[§l§aTN-AntiCheat§r] 初めに §6/function start§f を実行してください');
  }
});

world.events.dataDrivenEntityTriggerEvent.subscribe(ev => {
  const { entity, id } = ev;
  if (!(entity instanceof Player) || id != 'ac:start') return;
  
  if (world.getDynamicProperty(properties.ownerId)) return entity.tell('TNAC is already registered!');
  
  world.setDynamicProperty(properties.ownerId, entity.id);
  Permissions.add(entity, 'admin');
  
  ac.enable();
}, {
  entityTypes: [ 'minecraft:player' ],
  eventTypes: [ 'ac:start' ]
});