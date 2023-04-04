import { ActionFormData } from '@minecraft/server-ui';


export class ActionForm {
  constructor() {
    /**
     * @type {ActionFormData}
     * @readonly
     */
    this._data = new ActionFormData();

    /**
     * @type {import('../types/ActionForm').ActionFormButton[]} 
     * @readonly
     */
    this.buttons = [];
  }
  
  /**
   * 
   * @param {import('@minecraft/server').Player} player 
   * @returns {Promise<import('../types/ActionForm').ActionFormResponse>}
   */
  async show(player) {
    /** @type {import('../types/ActionForm').ActionFormResponse} */
    const res = await this._data.show(player);
    if (!res.canceled) res.button = this.buttons[res.selection];
    return res;
  }
  
  /**
   * 
   * @param {string} text 
   * @returns {ActionForm}
   */
  body(text) {
    this._data.body(text);
    return this;
  }
  
  /**
   * 
   * @param {string} text 
   * @param {string} [iconPath] 
   * @param {any} [id] 
   * @returns {ActionForm}
   */
  button(text, iconPath, id) {
    this._data.button(text, iconPath);
    this.buttons.push({ text, iconPath, id });
    return this;
  }
  
  /**
   * 
   * @param {string} text 
   * @returns {ActionForm}
   */
  title(text) {
    this._data.title(text);
    return this;
  }
}