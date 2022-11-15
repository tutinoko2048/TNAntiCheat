import { world } from '@minecraft/server';
import { TNAntiCheat } from './ac';
import { events } from './lib/events/index';
import './util/timer';
import './system/dog';
import './system/registerProperties';

const ac = new TNAntiCheat();
events.worldLoad.subscribe(() => {
  ac.enable();
});