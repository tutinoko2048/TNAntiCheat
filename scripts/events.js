import { Event } from './util/Event';

export const events = /** @type {const} */ ({
  /** @type {Event<[message: string]>} */
  notify: new Event(),

  /** @type {Event<[log: import('./types').ActionLog]>} */
  actionLogCreate: new Event(),

  /** @type {Event<[event: import('./types').ConfigUpdateEvent]>} */
  configUpdate: new Event(),

  /** @type {Event<[event: import('./types').PlayerPermissionAddEvent]>} */
  playerPermissionAdd: new Event(),

  /** @type {Event<[event: import('./types').PlayerPermissionRemoveEvent]>} */
  playerPermissionRemove: new Event(),
  
  /** @type {Event<[event: import('./types').PlayerTempkickEvent]>} */
  playerTempKick: new Event(),

  /** @type {Event<[event: import('./types').PlayerKickEvent]>} */
  playerKick: new Event(),

  /** @type {Event<[event: import('./types').PlayerBanEvent]>} */
  playerBan: new Event(),

  /** @type {Event<[event: import('./types').PlayerUnbanAddEvent]>} */
  playerUnbanAdd: new Event(),

  /** @type {Event<[event: import('./types').PlayerUnbanRemoveEvent]>} */
  playerUnbanRemove: new Event(),

  /** @type {Event<[event: import('./types').PlayerUnbanSuccessEvent]>} */
  playerUnbanSuccess: new Event(),

  /** @type {Event<[event: import('./types').PlayerMuteUpdateEvent]>} */
  playerMuteUpdate: new Event(),

  /** @type {Event<[event: import('./types').PlayerFreezeUpdateEvent]>} */
  playerFreezeUpdate: new Event(),

  /** @type {Event<[event: import('./types').PlayerFlaggedEvent]>} */
  playerFlagged: new Event(),
});
