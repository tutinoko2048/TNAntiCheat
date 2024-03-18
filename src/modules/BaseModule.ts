import type { Main } from '@/main';
import { ModuleConfig } from '@/types';
import { config } from '@config';

export class BaseModule {
  public main: Main | undefined;
  public isLoaded: boolean = false;

  constructor(
    public readonly moduleName: string,
    private readonly configKey: keyof ModuleConfig
  ) {}

  load(main: Main) {
    this.main = main;
    this.isLoaded = true;
  }

  get config() {
    return config.module[this.configKey];
  }
}
