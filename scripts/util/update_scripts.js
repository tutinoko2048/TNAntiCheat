import { world } from '@minecraft/server';
import { DataManager } from './DataManager';
import { PropertyIds } from './constants';

export function updateConfig() {
  const data = DataManager.fetch();
  delete data.crasher; // crasher削除
  
  if (data.instaBreak && 'place' in data.instaBreak) { // instaBreak.place → .cancel
    data.instaBreak.cancel = data.instaBreak.place;
    delete data.instaBreak.place;
  }
  
  if (data.nuker && 'place' in data.nuker) { // nuker.place → .cancel
    data.nuker.cancel = data.nuker.place;
    delete data.nuker.place;
  }

  if (data.others?.sendws !== undefined) {
    data.logger ??= {};
    data.logger.sendws = data.others.sendws;
    delete data.others.sendws;
  }

  if (data.others?.shortName !== undefined) {
    data.logger ??= {};
    data.logger.shortName = data.others.shortName;
    delete data.others.shortName;
  }

  if (typeof data.creative?.defaultGamemode === 'string') {
    // convert adventure to Adventure
    data.creative.defaultGamemode = data.creative.defaultGamemode[0].toUpperCase() + data.creative.defaultGamemode.slice(1);
  }
  
  DataManager.save(data);
}

export function updateDynamicProperty() {
  const ownerIdOld = world.getDynamicProperty(PropertyIds.ownerId);
  if (ownerIdOld) {
    world.setDynamicProperty(PropertyIds.ownerId);
    world.setDynamicProperty(PropertyIds.isRegistered, true);
    console.warn('[TN-AntiCheat] [DP] Successfully updated!');
  }
}