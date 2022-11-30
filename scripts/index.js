import { system, world, Player } from '@minecraft/server';
import './ac.js';
import config from './config.js';
import { detected } from './util/util';

console.warn('[TN-AntiCheat] index.js >> loaded');

system.events.beforeWatchdogTerminate.subscribe(ev => {
  ev.cancel = true;
});

Player.prototype.kick = async function (reason = 'No reason') {
  if (this.hasTag(config.tag.op)) return;
  const name = this.name;
  try {
    await this.runCommandAsync(`kick "${this.name}" §f§lKicked by TN-AntiCheat\n§cReason: §r${reason}`); // 普通はこっち
    detected(`Kicked §l§c${name}§r >> ${reason}`);
  } catch {
    // 再参加可能なkickを実行
    this.triggerEvent('tn:kick'); // 変な名前で蹴れない時はこっち
    detected(`Kicked §l§c${name}§r (addon) >> ${reason}`);
  }
}
