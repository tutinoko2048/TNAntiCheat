import { world, EquipmentSlot, CustomCommandParamType, CustomCommandStatus } from '@minecraft/server';
import { PermissionType, Permissions } from '../../util/Permissions';
import { Util } from '../../util/util';
import { getCPS } from '../../modules/combat';
import { BanManager } from '../../util/BanManager';
import { commandHandler, failure, success } from '../../lib/exports';
import { AdminPermission } from '../utils';

/**
 * @typedef {import('@minecraft/server').DimensionLocation} DimensionLocation
 * @typedef {import('@minecraft/server').Vector3} Vector3
 */

export default function() {
  commandHandler.register({
    name: 'tn:status',
    description: '§a指定したプレイヤーに関する情報を表示します',
    aliases: [ 'tn:stat' ],
    permission: AdminPermission,
  }, (params, origin) => {
    if (!origin.isSendable()) return CustomCommandStatus.Failure;
    
    let target;
    if (params.target) {
      if (params.target.length === 0) return failure('セレクターに合う対象がありません');
      if (params.target.length > 1) return failure('セレクターに合う対象が多すぎます');
      target = params.target[0];
    } else {
      const player = origin.getPlayer();
      if (!player) return failure('ターゲットを指定する必要があります');
      target = player;
    }

    const { x, y, z } = Util.vectorNicely(target.location);
    const { currentValue, effectiveMax } = target.getComponent('minecraft:health');
    const equippable = target.getComponent('minecraft:equippable')
    const mainHand = equippable.getEquipment(EquipmentSlot.Mainhand)?.typeId;
    const offHand = equippable.getEquipment(EquipmentSlot.Offhand)?.typeId;
    const cps = getCPS(target);
    const spawnPoint = target.getSpawnPoint() ?? world.getDefaultSpawnLocation();
    const spawnLoc = Util.vectorNicely(spawnPoint);

    const perm = (p) => Util.isOP(p) ? '§aOP§f' : Permissions.has(p, PermissionType.Builder) ? '§eBuilder§f' : 'Member';
    const bool = (b) => b ? '§aYes§f' : '§cNo§f';
    const title = `§l§e--- ${target.name} ---§r`;
    
    const message = [
      title,
      `§7Name: §f${target.name}`,
      `§7Permission: §f${perm(target)}`,
      `§7Location: §f[${x}, ${y}, ${z}]`,
      `§7Dimension: §f${target.dimension.id.replace('minecraft:', '')}`,
      `§7Gamemode: §f${target.getGameMode()}`,
      `§7Health: §f${currentValue}/${effectiveMax}`,
      `§7MainHand: §f${mainHand?.replace('minecraft:', '') ?? 'none'}`,
      `§7OffHand: §f${offHand?.replace('minecraft:', '') ?? 'none'}`,
      `§7SpawnPoint: §f[${spawnLoc.x}, ${spawnLoc.y}, ${spawnLoc.z}]`,
      `§7ID: §f${target.id}`,
      target.joinedAt ? `§7JoinedAt: §f${Util.getTime(target.joinedAt)}` : null,
      `§7CPS: §f${cps}`,
      `§7isMuted: ${bool(BanManager.isMuted(target))}`,
      `§7isFrozen: ${bool(false)}`, // AC instance needed for frozenPlayerMap
      // target.flyACount ? `§7§oFly/A count: §r${target.flyACount}` : null,
      target.speedACount ? `§7§oSpeed/A count: §r${target.speedACount}` : null,
      target.autoClickerCount ? `§7§oAutoClicker count: §r${target.autoClickerCount}` : null,
      target.reachACount ? `§7§oReach/A count: §r${target.reachACount}` : null,
      target.reachBCount ? `§7§oReach/B count: §r${target.reachBCount}` : null,
      target.reachCCount ? `§7§oReach/C count: §r${target.reachCCount}` : null,
      target.placeBCount ? `§7§oPlaceCheck/B count: §r${target.placeBCount}` : null,
      target.spammerACount ? `§7§oSpammer/A count: §r${target.spammerACount}` : null,
      target.spammerBCount ? `§7§oSpammer/B count: §r${target.spammerBCount}` : null,
      target.spammerCCount ? `§7§oSpammer/C count: §r${target.spammerCCount}` : null,
      '§a' + '-'.repeat(title.length - 5)
    ].filter(Boolean).join('§r\n');
    
    return success(message);
  }, {
    target: [CustomCommandParamType.PlayerSelector]
  });
}
