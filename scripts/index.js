import { world, system, Player } from '@minecraft/server';
import { TNAntiCheat } from './ac';
import { events } from './lib/events/index.js';
import { PropertyIds } from './util/constants';
import { Permissions } from './util/Permissions';
import './system/dog.js';
import './system/register_properties.js';

const ac = new TNAntiCheat();
events.worldLoad.subscribe(() => {
  if (world.getDynamicProperty(PropertyIds.ownerId)) {
    try {
      ac.enable();
    } catch (e) { console.error(e, e.stack) }
    
  } else {
    world.sendMessage('[§l§aTN-AntiCheat§r] 初めに §6/function start§f を実行してください');
  }
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
  if (world.getDynamicProperty(PropertyIds.ownerId)) return player.sendMessage('TNAC is already registered!');
  
  world.setDynamicProperty(PropertyIds.ownerId, player.id);
  Permissions.add(player, 'admin');
  
  ac.enable();
  player.sendMessage('§aAdmin権限が付与されました。"!help" でコマンド一覧を表示します');
}
