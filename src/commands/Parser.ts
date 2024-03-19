import { Vector3 } from '@minecraft/server';

export class InvalidArgumentError extends Error {
  constructor(public argumentIndex: number) {
    super();
  }
}

export interface ParseContext {
  index: number;
  args: string[];
}

export namespace StringArgument {
  export function parse(ctx: ParseContext): string {
    return ctx.args[ctx.index];
  }
}

export namespace NumberArgument {
  export function parse(ctx: ParseContext): number {
    const value = Number(ctx.args[ctx.index]);
    if (Number.isNaN(value)) throw new InvalidArgumentError(ctx.index);
    return value;
  }
}

export namespace Vector3Argument {
  export function parse(ctx: ParseContext): Vector3 {
    const x = NumberArgument.parse(ctx);
    ctx.index++;
    const y = NumberArgument.parse(ctx);
    ctx.index++;
    const z = NumberArgument.parse(ctx);
    return { x, y, z };
  }
}
