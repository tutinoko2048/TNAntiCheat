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