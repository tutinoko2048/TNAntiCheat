// @ts-check

export class Command {
  /**
   * @param {Omit<import('./types').CommandData, 'func'>} data
   * @param {import('./types').CommandCallback} [func]
   */
  constructor(data, func) {
    /** @type {import('./types').CommandData} */
    this.data = data;
    
    this.data.func = func;
  }
  
  toJSON() {
    return this.data;
  }
}