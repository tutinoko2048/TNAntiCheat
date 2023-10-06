export declare class PlaceHolder<T extends Readonly<Record<string, unknown>>> {
    private _prefix;
    private holder;
    private startBracket;
    private endBracket;
    constructor(_prefix?: PlaceHolder.Prefix, brackets?: PlaceHolder.Brackets);
    private _parse;
    parse(str: string, params: Partial<T>): string;
    parse(obj: Readonly<Record<string | number | symbol, unknown>>, params: Partial<T>): string;
    register(key: string, callback: (params: Partial<T>) => unknown, force?: boolean): this;
    list(): string[];
    get prefix(): PlaceHolder.Prefix;
    set prefix(prefix: PlaceHolder.Prefix);
    get brackets(): PlaceHolder.Brackets;
    set brackets(brackets: PlaceHolder.Brackets);
}
export declare namespace PlaceHolder {
    const allowPrefix: readonly ["!", "#", "%", "&", "-", "=", "^"];
    type Prefix = typeof allowPrefix[number];
    const allowBrackets: readonly ["[]", "{}", "()", "<>"];
    type Brackets = typeof allowBrackets[number];
}
export declare namespace Duration {
    const durations: {
        y: {
            time: number;
            long: string;
        };
        w: {
            time: number;
            long: string;
        };
        d: {
            time: number;
            long: string;
        };
        h: {
            time: number;
            long: string;
        };
        m: {
            time: number;
            long: string;
        };
        s: {
            time: number;
            long: string;
        };
        ms: {
            time: number;
            long: string;
        };
    };
    export type List = keyof typeof durations;
    export function toMS(text: string): number;
    export function parse(ms?: number, pass?: List[]): Partial<Record<List, number>>;
    export function format(ms: number, compact: boolean, pass?: List[]): string;
    export function format(ms: number, template: string): string;
    export {};
}
