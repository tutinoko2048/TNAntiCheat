import { world, system, Player } from '@minecraft/server';
import { TNAntiCheat } from './ac';
import { events } from './lib/events/index.js';
import { properties } from './util/constants';
import { Permissions } from './util/Permissions';
import './system/dog.js';
import './system/register_properties.js';
//import './system/polyfill.js'; // not needed after 1.19.60
const ac = new TNAntiCheat();
events.worldLoad.subscribe(() => {
  if (world.getDynamicProperty(properties.ownerId)) {
    try {
      ac.enable();
    } catch (e) { console.error(e, e.stack) }
    
  } else {
    world.sendMessage('[§l§aTN-AntiCheat§r] 初めに §6/function start§f を実行してください');
  }
});

world.afterEvents.dataDrivenEntityTriggerEvent.subscribe(ev => {
  const { entity, id } = ev;
  if (!(entity instanceof Player) || id != 'ac:start') return;
  start(entity);
  
}, {
  entityTypes: [ 'minecraft:player' ],
  eventTypes: [ 'ac:start' ]
});

system.afterEvents.scriptEventReceive.subscribe(ev => {
  const { id, sourceEntity } = ev;
  if (!(sourceEntity instanceof Player) || id != 'ac:start') return;
  start(sourceEntity);
}, {
  namespaces: [ 'ac' ]
});

/** @param {Player} player */
function start(player) {
  if (world.getDynamicProperty(properties.ownerId)) return player.sendMessage('TNAC is already registered!');
  
  world.setDynamicProperty(properties.ownerId, player.id);
  Permissions.add(player, 'admin');
  
  ac.enable();
  player.sendMessage('§aAdmin権限が付与されました。"!help" でコマンド一覧を表示します');
}
