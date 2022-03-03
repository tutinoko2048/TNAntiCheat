import { world } from 'mojang-minecraft'
import './ac.js'

const dimension = world.getDimension('overworld');

function sendCmd(command) {
  try {
    return dimension.runCommand(command);
  } catch(e) {
    console.error('cmdError:',e);
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
