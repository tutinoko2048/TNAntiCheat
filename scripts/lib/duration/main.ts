export class PlaceHolder<T extends Readonly<Record<string, unknown>>> {
  private holder: Map<string, { key: string, callback: (params: Partial<T>) => unknown }>;
  private startBracket!: string;
  private endBracket!: string;
  constructor(private _prefix: PlaceHolder.Prefix = '!', brackets: PlaceHolder.Brackets = '[]') {
    this.holder = new Map();
    this.brackets = brackets;
  }

  private _parse(str: string, params: Partial<T>): string {
    return str.replace(new RegExp(`(?<!\\\\)\\${this._prefix}(?<!\\\\)\\${this.startBracket}(\\w+)(?<!\\\\)\\${this.endBracket}`, 'g'), (input, key) => {
      const placeholder = this.holder.get(key);
      return String(placeholder?.callback?.(params) || input);
    });
  }

  parse(str: string, params: Partial<T>): string;
  parse(obj: Readonly<Record<string | number | symbol, unknown>>, params: Partial<T>): string;
  parse(str: string | Readonly<Record<string | number | symbol, unknown>>, params: Partial<T>) {
    if (typeof str === 'string') return this._parse(str, params);
    return JSON.parse(JSON.stringify(str), (_, value) => {
      if (typeof value === 'string') return this._parse(value, params);
      return value;
    });
  }

  register(key: string, callback: (params: Partial<T>) => unknown, force = false) {
    if (!key) throw new TypeError('A placeholder must be specified');
    if (!force && this.holder.has(key)) throw new TypeError('The placeholder is already registered');
    this.holder.set(key, { key, callback });
    return this;
  }

  list() {
    return Array.from(this.holder.keys(), key => `${this._prefix}${this.startBracket}${key}${this.endBracket}`);
  }

  get prefix() {
    return this._prefix;
  }

  set prefix(prefix: PlaceHolder.Prefix) {
    if (!PlaceHolder.allowPrefix.includes(prefix)) throw new TypeError(`${prefix} can't be used for prefix. Only the following values can be used (${PlaceHolder.allowPrefix.join(',')})`);
    this._prefix = prefix;
  }

  get brackets() {
    return [this.startBracket, this.endBracket].join('') as PlaceHolder.Brackets;
  }

  set brackets(brackets: PlaceHolder.Brackets) {
    if (!PlaceHolder.allowBrackets.includes(brackets)) throw new TypeError(`${brackets} can't be used for prefix. Only the following values can be used (${PlaceHolder.allowBrackets.join(',')})`);
    const [start, end] = brackets.split('');
    this.startBracket = start;
    this.endBracket = end;
  }
}

export namespace PlaceHolder {
  export const allowPrefix = ['!', '#', '%', '&', '-', '=', '^'] as const;
  export type Prefix = typeof allowPrefix[number];
  export const allowBrackets = ['[]', '{}', '()', '<>'] as const;
  export type Brackets = typeof allowBrackets[number];
}

export namespace Duration {
  const durations = {
    y: { time: 365 * 24 * 60 * 60 * 1000, long: 'year' },
    w: { time: 7 * 24 * 60 * 60 * 1000, long: 'week' },
    d: { time: 24 * 60 * 60 * 1000, long: 'day' },
    h: { time: 60 * 60 * 1000, long: 'hour' },
    m: { time: 60 * 1000, long: 'minute' },
    s: { time: 1000, long: 'second' },
    ms: { time: 1, long: 'millisecond' },
  };
  export type List = keyof typeof durations;

  const holder = new PlaceHolder<Partial<Record<List, number>>>('%', '{}');
  Object.keys(durations).forEach(key => {
    holder.register(key, data => {
      const date = data[key as List];
      return date ? date.toString() : '0';
    });
  });

  export function toMS(text: string) {
    const match = text.replace(/\s+/g, '').match(RegExp(Object.entries(durations).reduce((p, [short, { long }]) => p + `((?<${short}>-?(\\d*\\.\\d+|\\d+))(${short}|${long}))?`, '') + '$', 'i'));
    return Object.entries(match?.groups ?? {}).reduce((p, [key, value = 0]) => p + Number(value) * durations[key as List].time || 0, 0);
  }

  export function parse(ms = 0, pass: List[] = []): Partial<Record<List, number>> {
    const absMs = Math.abs(ms);
    return Object.fromEntries(Object.entries(durations)
      .filter(([short]) => !pass.includes(short as List))
      .sort(([, { time: a }], [, { time: b }]) => b - a)
      .map(([k, v], i, a) => ({ ...v, short: k, diff: a[i - 1]?.[1]?.time / v.time }))
      .map(({ short, long, time, diff }) => ({ short, long, duration: isNaN(diff) ? Math.floor(absMs / time) : Math.floor(Math.floor(absMs / time) % diff) }))
      .filter(({ duration }) => duration !== 0)
      .map(v => [v.short, v.duration])) as Partial<Record<List, number>>;
  }

  export function format(ms: number, compact: boolean, pass?: List[]): string;
  export function format(ms: number, template: string): string;
  export function format(ms = 0, template: string | boolean = '', pass: List[] = []): string {
    if (typeof template === 'string' && template)
      return holder.parse(template, parse(ms, Object.keys(durations).filter(v => !template.includes(`%{${v}}`)) as List[]));

    return Object.entries(parse(ms, pass)).map(([short, duration]) => {
      const { long } = durations[short as List];
      return `${Math.sign(ms) === -1 ? '-' : ''}${duration}${template ? short : long}`;
    }).join(' ');
  }
}