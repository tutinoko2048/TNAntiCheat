import { world, EntityLifetimeState } from '@minecraft/server';
import { Util } from '../util/util';
import config from '../config.js';
import { isIllegalItem, isSpawnEgg, queueNotify } from './util';
const overworld = world.getDimension('overworld');

const despawnable = ['minecraft:npc', 'minecraft:command_block_minecart'];

/** @param {import('@minecraft/server').Entity} entity */
export function entityCheck(entity) {
  if (!entity.isValid()) return; // スポーンしてすぐしぬと間に合わないから対策
  const { typeId, location } = entity;

  if (config.entityCheckC.state) {
    if (typeId == 'minecraft:arrow') {
      world.arrowSpawnCount++
      if (world.arrowSpawnCount > config.entityCheckC.maxArrowSpawns) return entity.kill();
      
    } else if (typeId == 'minecraft:command_block_minecart') {
      world.cmdSpawnCount++
      if (world.cmdSpawnCount > config.entityCheckC.maxCmdMinecartSpawns) return entity.kill();
    }
  }
  
  if (config.entityCheckA.state && config.entityCheckA.detect.includes(typeId)) {
    const loc = Util.vectorNicely(location);
    entity.kill();
    if (config.entityCheckA.punishment != 'none') queueNotify('entityCheck', { typeId, ...loc });
    if (despawnable.includes(typeId)) try { entity.triggerEvent('tn:despawn') } catch {}
    
  } else if (config.entityCheckB.state && typeId === 'minecraft:item') {
    const item = entity.getComponent('minecraft:item')?.itemStack;
    if (isIllegalItem(item?.typeId) || (config.entityCheckB.spawnEgg && isSpawnEgg(item?.typeId))) {
      const loc = Util.vectorNicely(location);
      entity.kill();
      if (config.entityCheckB.punishment != 'none') queueNotify('entityCheck', { typeId, item: item.typeId, ...loc });
    }
    
  } else if (config.entityCheckD.state && config.entityCheckD.detect.includes(typeId)) {
    const container = entity.getComponent('minecraft:inventory')?.container;
    if (container) entityCheckD(container);
  }
}

/** @param {import('@minecraft/server').Container} container */
function entityCheckD(container) {
  if (!container) return;

  for (let i = 0; i < container.size; i++) {
    const item = container.getItem(i);
    if (
      isIllegalItem(item?.typeId) ||
      (config.entityCheckD.spawnEgg && isSpawnEgg(item?.typeId))
    ) {
      container.setItem(i);
      if (config.others.debug) console.warn(`EntityCheck/D cleared: ${item.typeId}`);
    }
  }
}

/** @type {Object<string, number>} */
const countCooltime = {};

export function entityCounter() {
  if (!config.entityCounter.state) return;
  
  /** @type {Object<string, number>} */
  const entities = {};
  
  const excludes = Object.keys(config.entityCounter.detect).filter(id => config[id] === -1);
  for (const entity of overworld.getEntities({ excludeTypes: [ 'minecraft:player', ...excludes ] })) {
    entities[entity.typeId] ??= 0;
    entities[entity.typeId]++;
  }
  
  for (const [typeId, count] of Object.entries(entities)) {
    const maxCount = config.entityCounter.detect[typeId] ?? config.entityCounter.defaultCount;
    const canWarn = countCooltime[typeId] ? (Date.now() - countCooltime[typeId] > config.entityCounter.warnInterval * 50) : true; // 入力はtickだからmsに変換する 1tick=50ms
    if (maxCount !== -1 && count > maxCount && canWarn) {
      countCooltime[typeId] = Date.now();
      Util.notify(`[EntityCounter] §c${typeId}§f の数が設定値を超えています §7( §6${count} > ${maxCount} §7)§r`);
      if (config.entityCounter.kill) {
        delete countCooltime[typeId];
        killEntity(typeId);
      }
    }
  }
}

function killEntity(typeId) {
  for (const e of overworld.getEntities({ type: typeId })) e.kill();
}