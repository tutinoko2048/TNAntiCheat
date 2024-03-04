import { world } from '@minecraft/server';
import { Main } from './main';

const main = new Main();

world.afterEvents.worldInitialize.subscribe(() => {
  main.initialize();
});