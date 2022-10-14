import { system, world, Player } from '@minecraft/server';
import './ac.js';
import config from './config.js';

console.warn('[TN-AntiCheat] index.js >> loaded');

system.events.beforeWatchdogTerminate.subscribe(ev => {
  ev.cancel = true;
});

Player.prototype.kick = async function (reason = 'No reason') {
  if (this.hasTag(config.tag.op)) return;
  try {
    await this.runCommandAsync(`kick "${this.name}" §f§lKicked by TN-AntiCheat\n§cReason: §r${reason}`); // 普通はこっち
    detected(`Kicked §l§c${this.name}§r >> ${reason}`);
  } catch {
    // ビヘイビア側でinstant_despawnすれば§"な名前の人でも蹴れます。再参加可能なので注意
    this.triggerEvent('tn:kick'); // 変な名前で蹴れない時はこっち
    detected(`Kicked §l§c${this.name}§r (addon) >> ${reason}`);
  }
}
