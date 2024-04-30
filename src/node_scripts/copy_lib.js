const fs = require('fs-extra');
const path = require('node:path');
const node_modules = path.join(__dirname, '../../node_modules');

fs.copySync(path.join(node_modules, '@minecraft/vanilla-data/lib'), path.join(__dirname, '../util/vanilla-data'));
