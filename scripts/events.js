import { Event } from './util/Event';

export const events = /** @type {const} */ ({
  /** @type {Event<[string]>} */
  notify: new Event(),

  /** @type {Event<[import('./types').ActionLog]>} */
  actionLogCreate: new Event(),

  /** @type {Event<[import('./types').ConfigUpdateEvent]>} */
  configUpdate: new Event(),

  /** @type {Event<[import('./types').PlayerPermissionAddEvent]>} */
  playerPermissionAdd: new Event(),

  /** @type {Event<[import('./types').PlayerPermissionRemoveEvent]>} */
  playerPermissionRemove: new Event(),
  
  /** @type {Event<[import('./types').PlayerTempkickEvent]>} */
  playerTempKick: new Event(),

  /** @type {Event<[import('./types').PlayerKickEvent]>} */
  playerKick: new Event(),

  /** @type {Event<[import('./types').PlayerBanEvent]>} */
  playerBan: new Event(),

  /** @type {Event<[import('./types').PlayerUnbanAddEvent]>} */
  playerUnbanAdd: new Event(),

  /** @type {Event<[import('./types').PlayerUnbanRemoveEvent]>} */
  playerUnbanRemove: new Event(),

  /** @type {Event<[import('./types').PlayerUnbanSuccessEvent]>} */
  playerUnbanSuccess: new Event(),

  /** @type {Event<[import('./types').PlayerMuteUpdateEvent]>} */
  playerMuteUpdate: new Event(),

  /** @type {Event<[import('./types').PlayerFreezeUpdateEvent]>} */
  playerFreezeUpdate: new Event(),

  /** @type {Event<[import('./types').PlayerFlaggedEvent]>} */
  playerFlagged: new Event(),
});
