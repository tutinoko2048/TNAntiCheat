export interface FormatterOptions {
    maxDepth?: number;
    lineLength?: number;
    arrayIndex?: boolean;
    hideFunction?: boolean;
}
export declare function format(value: any, options?: FormatterOptions): string;
export {};
