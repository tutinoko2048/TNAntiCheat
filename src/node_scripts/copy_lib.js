const fs = require('fs-extra');
const path = require('node:path');
const node_modules = path.join(__dirname, '../../node_modules');

{
  const source = path.join(node_modules, '@minecraft/vanilla-data');
  const target = path.join(__dirname, '../utils/vanilla-data');
  fs.copySync(path.join(source, './lib'), target);
}