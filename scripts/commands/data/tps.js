import { getTPS } from '../../util/tps';
import { Command } from '../Command';

const tpsCommand = new Command({
  name: 'tps',
  description: 'TPSを表示します',
  args: [ '' ],
  aliases: [ 'ping' ],
}, (origin) => {
  const tps = getTPS();
  origin.send(`Current TPS: ${getColor(tps)}${tps.toFixed(1)}/20.0`);
});

function getColor(tps) {
  if (tps >= 18) return '§a';
  if (tps >= 14) return '§e';
  if (tps >= 8) return '§6';
  return '§c';
}

export default tpsCommand;