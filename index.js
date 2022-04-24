import { world, Player, Entity } from 'mojang-minecraft'
import './ac.js'
import config from './config.js'

const dimension = world.getDimension('overworld');

Player.prototype.kick = function (reason = 'No reason') {
  if (this.hasTag(config.tag.op)) return;
  try {
    this.runCommand(`kick ${this.name} §f§lKicked by TNAntiCheat\n§cReason: §r${reason}`); // 普通はこっち
    sendMsg(`[AC] Kicked §l§c${this.name}§r >> ${reason}`);
  } catch {
    // ビヘイビア側でinstant_despawnすれば§"な名前の人でも蹴れます。再参加可能なので注意
    this.triggerEvent('tn:kick'); // 変な名前で蹴れない時はこっち
    sendMsg(`[AC] Kicked §l§c${this.name}§r (addon) >> ${reason}`);
  }
}

function sendCmd(command) {
  try {
    return dimension.runCommand(command);
  } catch(e) {
    //console.error('cmdError:',e);
    return {err: e.message}
  }
}

function sendMsg(msg, target = '@a') {
  if (!target.match(/@s|@p|@a|@r|@e/)) target = `"${target}"`;
  let rawtext = JSON.stringify({
    rawtext: [{ text: String(msg) }]
  });
  sendCmd(`tellraw ${target} ${rawtext}`);
}
  
export {dimension, sendCmd, sendMsg}
