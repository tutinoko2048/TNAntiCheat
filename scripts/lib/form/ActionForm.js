import { ActionFormData } from '@minecraft/server-ui';

export class ActionForm {
  constructor() {
    /**
     * @type {ActionFormData}
     * @private
     * @readonly
     */
    this._data = new ActionFormData();

    /**
     * @type {import('./ActionFormResponse').ActionFormButton[]} 
     * @readonly
     */
    this.buttons = [];
  }
  
  /**
   * 
   * @param {import('@minecraft/server').Player} player 
   * @returns {Promise<import('./ActionFormResponse').ActionFormResponse>}
   */
  async show(player) {
    /** @type {import('./ActionFormResponse').ActionFormResponse} */
    const res = await this._data.show(player);
    if (!res.canceled) res.button = this.buttons[res.selection];
    return res;
  }
  
  /**
   * @param {string} text 
   * @returns {this}
   */
  body(text) {
    this._data.body(text);
    return this;
  }
  
  /**
   * @param {string} text 
   * @param {string} [iconPath] 
   * @param {string|number} [id] 
   * @returns {this}
   */
  button(text, iconPath, id) {
    this._data.button(text, iconPath);
    this.buttons.push({ text, iconPath, id });
    return this;
  }
  
  /**
   * @param {string} text 
   * @returns {this}
   */
  title(text) {
    this._data.title(text);
    return this;
  }
}