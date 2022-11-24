export class BaseManager {
  #ac;
  
  constructor(ac) {
    this.#ac = ac;
  }
  
  get ac() { return this.#ac }
}