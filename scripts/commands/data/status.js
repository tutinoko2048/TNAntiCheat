import { world, EquipmentSlot } from '@minecraft/server';
import { PermissionType, Permissions } from '../../util/Permissions';
import { Util } from '../../util/util';
import { Command } from '../Command';
import { CommandError } from '../CommandError';
import { getCPS } from '../../modules/combat';
import { BanManager } from '../../util/BanManager';

/**
 * @typedef {import('@minecraft/server').DimensionLocation} DimensionLocation
 * @typedef {import('@minecraft/server').Vector3} Vector3
 */

const statusCommand = new Command({
  name: 'status',
  description: '指定したプレイヤーに関する情報を表示します',
  aliases: [ 'stat' ],
  permission: (player) => Util.isOP(player),
  args: [ '[name: playerName]' ]
}, (origin, args, manager) => {
  const [ _targetName ] = args;
  const targetName = Util.parsePlayerName(_targetName, origin.isPlayerOrigin() && origin.sender);
  if (!targetName && origin.isServerOrigin()) throw new CommandError('対象のプレイヤーを指定してください');

  const sender = origin.isPlayerOrigin() ? origin.sender : null;
  const target = targetName ? Util.getPlayerByName(targetName): sender;
  if (!target) throw new CommandError(`プレイヤー ${targetName} が見つかりませんでした`);
  
  const { x, y, z } = Util.vectorNicely(target.location);
  const { currentValue, effectiveMax } = target.getComponent('minecraft:health');
  const equippable = target.getComponent('minecraft:equippable')
  const mainHand = equippable.getEquipment(EquipmentSlot.Mainhand)?.typeId;
  const offHand = equippable.getEquipment(EquipmentSlot.Offhand)?.typeId;
  const cps = getCPS(target);
  const spawnPoint = target.getSpawnPoint() ?? world.getDefaultSpawnLocation();
  const spawnLoc = Util.vectorNicely(spawnPoint);

  const perm = (p) => Util.isOP(p) ? '§aOP§f' : Permissions.has(p, PermissionType.Builder) ? '§eBuilder§f' : 'Member';
  const bool = (v) => v ? '§atrue§r' : '§cfalse§r';

  const title = `§a--- ${target.name}'s status ---§r`;
  origin.send([
    title,
    `§7Permission: §f${perm(target)}`,
    `§7Location: §f${x}, ${y}, ${z} (${target.dimension.id})`,
    `§7Health: §f${Math.floor(currentValue)}/${effectiveMax}`,
    `§7GameMode: §f${target.getGameMode()}`,
    `§7SpawnPoint: §f${spawnLoc.x}, ${spawnLoc.y}, ${spawnLoc.z}`,
    mainHand ? `§7MainHand: §f${mainHand}` : null,
    offHand ? `§7OffHand: §f${offHand}` : null,
    `§7ID: §f${target.id}`,
    target.joinedAt ? `§7JoinedAt: §f${Util.getTime(target.joinedAt)}` : null,
    `§7CPS: §f${cps}`,
    `§7isMuted: ${bool(BanManager.isMuted(target))}`,
    `§7isFrozen: ${bool(manager.ac.frozenPlayerMap.has(target.id))}`,
    target.flyACount ? `§7§oFly/A count: §r${target.flyACount}` : null,
    target.speedACount ? `§7§oSpeed/A count: §r${target.speedACount}` : null,
    target.autoClickerCount ? `§7§oAutoClicker count: §r${target.autoClickerCount}` : null,
    target.placeBCount ? `§7§oPlaceCheck/B count: §r${target.placeBCount}` : null,
    target.spammerACount ? `§7§oSpammer/A count: §r${target.spammerACount}` : null,
    target.spammerBCount ? `§7§oSpammer/B count: §r${target.spammerBCount}` : null,
    target.spammerCCount ? `§7§oSpammer/C count: §r${target.spammerCCount}` : null,

    '§a' + '-'.repeat(title.length - 5)
  ].filter(Boolean).join('§r\n'));
});

export default statusCommand;