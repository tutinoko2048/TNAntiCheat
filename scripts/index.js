import { world } from '@minecraft/server';
import { TNAntiCheat } from './ac';
import { events } from './lib/events/index';
import './lib/timer';
import './system/dog';
import './system/register_properties';
import './system/polyfill';

const ac = new TNAntiCheat();
events.worldLoad.subscribe(() => {
  ac.enable();
});