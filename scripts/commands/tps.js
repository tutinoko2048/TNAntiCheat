export default {
  name: 'tps',
  description: 'TPSを表示します',
  args: [ '' ],
  aliases: [ 'ping' ],
  func: (sender, args, manager) => {
    const tps = manager.ac.getTPS();
    sender.tell(`Current TPS: ${getColor(tps)}${tps.toFixed(1)}`);
  }
}

function getColor(tps) {
  if (tps > 18) return '§a';
  if (tps > 14) return '§e';
  if (tps > 8) return '§6';
  return '§c';
}