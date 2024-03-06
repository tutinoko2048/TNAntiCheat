import { world } from '@minecraft/server';
import { config } from '@config';
import { version } from '@/util/constants';
import { _t } from '@/util/i18n';
import { module as nuker } from '@/modules/Nuker';

export class Main {
  static readonly version = version;
  
  private moduleCount: number = 0;
  
  initialize() {
    console.warn(`Loading TN-AntiCheat@${version}...`);

    config.load();
    world.sendMessage(_t('main.initialize.world'));

    // load modules
    nuker.load(this);

    console.warn(`[TN-AntiCheat] Loaded ${this.moduleCount} modules`);
  }
}
