import { EquipmentSlot } from "@minecraft/server";
import { PermissionType, Permissions } from "../../util/Permissions";
import { PropertyIds } from "../../util/constants";
import { Util } from "../../util/util";
import { Command } from "../Command";
import { CommandError } from "../CommandError";
import { getCPS } from "../../modules";

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
  const spawnPoint = target.getSpawnPoint();
  const spawnLoc = Util.vectorNicely(spawnPoint);

  const perm = (p) => Util.isOP(p) ? '§aop§f' : Permissions.has(p, PermissionType.Builder) ? '§ebuilder§f' : 'member';
  const bool = (v) => v ? '§atrue§r' : '§cfalse§r';

  origin.send([
    `--- ${target.name}'s status ---`,
    `§7Permission: §f${perm(target)}`,
    `§7Location: §f${x}, ${y}, ${z} (${target.dimension.id})`,
    `§7Health: §f${Math.floor(currentValue)} / ${effectiveMax}`,
    `§7GameMode: §f${Util.getGameMode(target)}`,
    `§7SpawnPoint: §f${spawnLoc.x} ${spawnLoc.y} ${spawnLoc.z} (${spawnPoint.dimension.id})`,
    mainHand ? `§7MainHand: §f${mainHand}` : null,
    offHand ? `§7OffHand: §f${offHand}` : null,
    `§7ID: §f${target.id}`,
    target.joinedAt ? `§7JoinedAt: §f${Util.getTime(target.joinedAt)}` : null,
    `§7CPS: §f${cps}`,
    `§7isMuted: ${bool(target.getDynamicProperty(PropertyIds.mute))}`,
    `§7isFrozen: ${bool(manager.ac.frozenPlayerMap.has(target.id))}`,
    target.flyACount ? `§7Fly/A Count: §f${target.flyACount}` : null,
    target.speedACount ? `§7Speed/A Count: §f${target.speedACount}` : null,
    target.autoClickerCount ? `§7AutoClicker Count: §f${target.autoClickerCount}` : null,
    target.placeBCount ? `§7PlaceCheck/B Count: §f${target.placeBCount}` : null,
  ].filter(Boolean).join('\n'));
});

export default statusCommand;