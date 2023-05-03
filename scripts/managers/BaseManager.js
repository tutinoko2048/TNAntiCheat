export class BaseManager {
  #ac;
  
  /** @param {import('../ac').TNAntiCheat} ac */
  constructor(ac) {
    this.#ac = ac;
  }
  
  get ac() { return this.#ac }
}