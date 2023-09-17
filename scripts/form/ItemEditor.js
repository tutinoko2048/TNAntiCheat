import { ActionForm } from '../lib/form/index';
import { Icons } from '../util/constants';
import { Util } from '../util/util';
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

/**
 * @param {Player} player 
 * @param {ItemStack} item 
 */
export async function editLore(player, item) {
  const lores = item.getLore();

  const form = new ActionForm();
  form.title(`Edit Lore [${item.typeId}]`);
  for (const index in lores) form.button(`${index}\n"${Util.safeString(lores[index], 28)}\r"`);
  if (lores.length < 20) form.button('値を追加 / Add value', Icons.plus, 'add');

  const { canceled, selection, button } = await form.show(player);
  if (canceled) return false;
  
  const addMode = button.id === 'add';
  const _value = addMode ? '' : lores[selection];
  const { canceled: inputCanceled, value, deleteValue } = await textInput(player, {
    label: 'Lore',
    placeholder: 'Lore',
    title: `Edit Lore [${selection}]`,
    defaultValue: _value,
    allowDelete: !addMode
  });
  if (inputCanceled) return false;

  let isChanged;
  if (deleteValue) {
    lores[selection] = undefined;
    isChanged = true;
  } else {
    if (value.length > 50) {
      player.sendMessage(`§c[Error] Loreは50文字以内である必要があります (${value.length}/50)`);
      return false;
    }
    lores[selection] = value;
    if (_value !== value) isChanged = true;
  }

  if (isChanged) item.setLore(lores.filter(Boolean));
  return isChanged;
}