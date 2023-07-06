import { DataManager } from './DataManager';

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