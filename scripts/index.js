import { world, Player } from '@minecraft/server';
import { TNAntiCheat } from './ac';
import { events } from './lib/events/index';
import { properties } from './util/constants';
import { Permissions } from './util/Permissions';
import './system/dog.js';
import './system/register_properties.js';
//import './system/polyfill.js'; // not needed after 1.19.60

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
  start(entity);
  
}, {
  entityTypes: [ 'minecraft:player' ],
  eventTypes: [ 'ac:start' ]
});

function start(player) {
  if (world.getDynamicProperty(properties.ownerId)) return player.tell('TNAC is already registered!');
  
  world.setDynamicProperty(properties.ownerId, player.id);
  Permissions.add(player, 'admin');
  
  ac.enable();
  player.tell('§aAdmin権限が付与されました。"!help" でコマンド一覧を表示します');
}