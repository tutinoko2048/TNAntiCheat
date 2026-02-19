//@ts-check

import { world } from '@minecraft/server';
import config from '../config.js';
import { ModerationManager } from '../util/ModerationManager';
import { Util } from '../util/util';

/**
 *
 * @param {import('@minecraft/server').Player} player
 */
export function invalidJoinA(player) {
  if (!config.invalidJoinA.state) return;

  if (world.getPlayers().length >= 2 && player.clientSystemInfo.maxRenderDistance === 0) {
    const { id, name } = player;
    ModerationManager.kick(player, '不正なクライアントでの接続を検知しました', false, true);
    Util.notify(`§7[InvalidJoin/A] §c${player.name}§r§7: 不正なクライアントでの接続を検知しました`);
    Util.writeLog({
      type: 'InvalidJoinA',
      message: '不正なクライアントでの接続を検知しました',
      playerId: id,
      playerName: name
    });
  }
}
