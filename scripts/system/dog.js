import { system } from '@minecraft/server';

system.beforeEvents.watchdogTerminate.subscribe(ev => {
  ev.cancel = true;
});