import { Util } from '@/utils/util';
import { Player, Vector2, Vector3, world } from '@minecraft/server';

export class InvalidArgumentError extends Error {
  constructor(public argumentIndex: number) {
    super();
  }
}

export class NoTargetsFoundError extends Error {}

export class ParseContext {
  constructor(
    public index: number,
    public readonly args: string[],
    public readonly origin?: Player
  ) {}

  get value() {
    return this.args[this.index];
  }

  next() {
    this.index++;
  }
}

export enum CommandArgumentType {
  String,
  Int,
  Float,
  Vector2,
  Vector3,
  PlayerSelector
}

function parseString(ctx: ParseContext): string {
  return ctx.value;
}

function parseNumber(ctx: ParseContext): number {
  const value = Number(ctx.value);
  if (Number.isNaN(value)) throw new InvalidArgumentError(ctx.index);
  return value;
}

function parseInt(ctx: ParseContext): number {
  const value = parseNumber(ctx);
  if (!Number.isInteger(value)) throw new InvalidArgumentError(ctx.index);
  return value;
}

const parseFloat = parseNumber;

function parseVector2(ctx: ParseContext): Vector2 {
  const x = parseNumber(ctx);
  ctx.next();
  const y = parseNumber(ctx);
  return { x, y }
}

function parseVector3(ctx: ParseContext): Vector3 {
  const x = parseNumber(ctx);
  ctx.next();
  const y = parseNumber(ctx);
  ctx.next();
  const z = parseNumber(ctx);
  return { x, y, z };
}

function parsePlayerSelector(ctx: ParseContext): Player[] {
  if (ctx.value.startsWith('@e')) throw new InvalidArgumentError(ctx.index);
  if (ctx.value.match(/@[spar]/)) {
    const mode: 's' | 'p' | 'a' | 'r' = ctx.value.slice(1) as any;

    if (mode === 's') {
      if (!ctx.origin) throw new NoTargetsFoundError();
      return [ctx.origin];
    }

    const result = (ctx.origin?.dimension ?? world).getPlayers({
      closest: mode === 'a' || mode === 'r' ? undefined : 1,
      location: ctx.origin?.location
    });
    if (result.length === 0) throw new NoTargetsFoundError();

    let players: Player[] = [];
    if (mode === 'a') players = result;
    if (mode === 'r') players[0] = Util.randomValue(result);
    if (mode === 'p') players[0] = result[0];
    if (players.length === 0) throw new NoTargetsFoundError();
    return players;

  } else {
    let value = ctx.value;
    if (value.startsWith('@')) value = value.slice(1);
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    const result = world.getPlayers({ name: value });
    if (!result[0]) throw new NoTargetsFoundError();
    return result;
  }
}

export const ArgumentParserMap = {
  [CommandArgumentType.String]: parseString,
  [CommandArgumentType.Int]: parseInt,
  [CommandArgumentType.Float]: parseFloat,
  [CommandArgumentType.Vector2]: parseVector2,
  [CommandArgumentType.Vector3]: parseVector3,
  [CommandArgumentType.PlayerSelector]: parsePlayerSelector
} as const;