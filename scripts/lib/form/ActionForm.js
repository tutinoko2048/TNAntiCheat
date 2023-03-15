import { ActionFormData } from '@minecraft/server-ui';

export class ActionForm {
  constructor() {
    this._data = new ActionFormData();
    this.body;
    this.title;
    this.buttons = [];
  }
  
  async show(player) {
    const res = await this._data.show(player);
    if (!res.canceled) res.button = this.buttons[res.selection];
    return res;
  }
  
  body(text) {
    this._data.body(text);
    this.body = text;
    return this;
  }
  
  button(text, iconPath, id) {
    this._data.button(text, iconPath);
    this.buttons.push({ text, iconPath, id });
    return this;
  }
  
  title(text) {
    this._data.title(text);
    this.title = text;
    return this;
  }
}