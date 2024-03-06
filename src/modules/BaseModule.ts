import type { Main } from '../main';

export class BaseModule {
  public main: Main | undefined;

  load(main: Main) {
    this.main = main;
  }
}
