export type Listener<T> = (...args: T) => void;

export declare class Event<T extends unknown[]> {
  constructor();

  onBefore(listener: Listener<T>): this;
  on(listener: Listener<T>): this;
  onceBefore(listener: Listener<T>): this;
  once(listener: Listener<T>): this;
  offBefore(listener: Listener<T>): this;
  off(listener: Listener<T>): this;
  /** @returns whether the event is successful, not canceled */
  emit(...args: T): boolean;
  removeAllListeners(): void;
}