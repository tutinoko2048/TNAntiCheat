import { world, Player } from 'mojang-minecraft';
import './ac.js';
import config from './config.js';


Player.prototype.kick = function (reason = 'No reason') {
  if (this.hasTag(config.tag.op)) return;
  try {
    this.runCommand(`kick ${this.name} §f§lKicked by TN-AntiCheat\n§cReason: §r${reason}`); // 普通はこっち
    detected(`Kicked §l§c${this.name}§r >> ${reason}`);
  } catch {
    // ビヘイビア側でinstant_despawnすれば§"な名前の人でも蹴れます。再参加可能なので注意
    this.triggerEvent('tn:kick'); // 変な名前で蹴れない時はこっち
    detected(`Kicked §l§c${this.name}§r (addon) >> ${reason}`);
  }
}

Player.prototype.sendMsg = function (msg) {
  let rawtext = JSON.stringify({
    rawtext: [{ text: String(msg) }]
  });
  this.runCommand(`tellraw @s ${rawtext}`);
}

export function detected(message) {
  if (config.sendws) { // say
    sendCmd(`say "[TN-AntiCheat] ${message}"`);
  } else { // tellraw
    sendMsg(`[TN-AntiCheat] ${message}`);
  }
}

export function sendCmd(command) {
  try {
    return world.getDimension('overworld').runCommand(command);
  } catch(e) {
    //console.error('cmdError:',e);
    return {err: e.message}
  }
}

export function sendMsg(msg, target = '@a') {
  if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
  let rawtext = JSON.stringify({
    rawtext: [{ text: String(msg) }]
  });
  sendCmd(`tellraw ${target} ${rawtext}`);
}
