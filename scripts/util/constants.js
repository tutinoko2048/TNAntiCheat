export const VERSION = '3.14.1';
export const DISCORD_URL = 'discord.gg/XGR8FcCeFc';

export const PropertyIds = /** @type {const} */ ({
  ban: 'tn:isBanned',
  banReason: 'tn:banReason',
  banExpireAt: 'tn:banExpireAt',
  configData: 'tn:configData',
  mute: 'tn:isMuted',
  /** @deprecated not used since v3.9.0 */
  ownerId: 'tn:ownerId',
  unbanQueue: 'tn:unbanQueue',
  isRegistered: 'tn:isRegistered',
});

export const Icons = /** @type {const} */ ({
  playerList: 'textures/ui/dressing_room_skins',
  entities: 'textures/items/egg_npc',
  config: 'textures/ui/icon_setting',
  returnBtn: 'textures/ui/realms_red_x',
  about: 'textures/items/book_written',
  logs: 'textures/ui/bookshelf_flat',
  
  inventory: 'textures/ui/icon_recipe_equipment',
  permission: 'textures/ui/icon_lock',
  enderchest: 'textures/blocks/ender_chest_front',
  mute: 'textures/ui/mute_on',
  kick: 'textures/ui/friend_glyph_desaturated',
  ban: 'textures/blocks/barrier',
  teleport: 'textures/items/ender_pearl',
  teleportHere: 'textures/items/ender_eye',
  tags: 'textures/items/name_tag',
  scores: 'textures/items/chalkboard_large',
  ability: 'textures/ui/icon_potion',
  unbanQueue: 'textures/ui/icon_map',
  
  plus: 'textures/ui/color_plus',
  clear: 'textures/ui/icon_trash',
  duplicate: 'textures/ui/copy',
  transfer: 'textures/ui/icon_import',
  edit: 'textures/ui/editIcon',
  reload: 'textures/ui/refresh_light',
  reset: 'textures/ui/refresh',
  
  op: 'textures/ui/permissions_op_crown',
  builder: 'textures/ui/icon_recipe_construction',
  member: 'textures/ui/permissions_member_star'
});

export const panelItem = {
  nameTag: '§r§f[§aTN-AntiCheat§f] 管理者用パネルを開く',
  lore: 'TNAC_AdminPanel' // 50文字以内にすること (1.20.20~)
}