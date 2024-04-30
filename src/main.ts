import { world } from '@minecraft/server';
import { config } from '@config';
import { version } from '@/utils/constants';
import { _t } from '@/utils/i18n';
import nuker from '@/modules/Nuker';
import { CommandHandler } from './commands/CommandHandler';

export class Main {
  static readonly version = version;

  public readonly commandHandler: CommandHandler = new CommandHandler(this);
  
  private moduleCount: number = 0;
  
  initialize() {
    console.warn(`Loading TN-AntiCheat@${version}...`);

    config.load();
    world.sendMessage(_t('main.initialize.world'));

    // load modules
    nuker.load(this);

    console.warn(`[TN-AntiCheat] Loaded ${this.moduleCount} modules`);

    this.commandHandler.load();
  }
}
