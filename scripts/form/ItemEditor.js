import { textInput } from './static_form';

/** @typedef {import('@minecraft/server').Player} Player */
/** @typedef {import('@minecraft/server').ItemStack} ItemStack */

/**
 * @param {Player} player 
 * @param {ItemStack} item 
 * @returns {Promise<boolean>} whether value has changed
 */
export async function editNameTag(player, item) {
  const { canceled, value } = await textInput(player, {
    label: 'NameTag',
    placeholder: 'NameTag',
    defaultValue: item.nameTag,
    title: `Edit NameTag [${item.typeId}]`
  });
  if (canceled) return false;

  const isChanged = item.nameTag !== value;
  if (isChanged) item.nameTag = value;
  return isChanged;
}