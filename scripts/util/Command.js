// @ts-check

export class Command {
  /**
   * @param {Omit<import('../types/index').ICommand, 'func'>} data
   * @param {import('../types/index').CommandCallback} [func]
   */
  constructor(data, func) {
    /** @type {import('../types/index').ICommand} */
    this.data = data;
    
    this.data.func = func;
  }
  
  toJSON() {
    return this.data;
  }
}