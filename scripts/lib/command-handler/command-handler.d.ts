/** command-handler v10 **/
import { Block, BlockType, CommandPermissionLevel, CustomCommandOrigin, CustomCommandParamType, CustomCommandResult, CustomCommandStatus, Dimension, Entity, ItemType, Player, Vector3 } from "@minecraft/server";

//#region src/enum.d.ts
declare class CommandEnum<T extends string | number = string | number> {
    readonly name: string;
    readonly values: Record<string, T>;
    constructor(name: string, values: Record<string, T>);
    getValue(name: string): T;
}

//#endregion
//#region src/origin.d.ts
declare abstract class CommandOrigin {
    protected readonly origin: CustomCommandOrigin;
    constructor(origin: CustomCommandOrigin);
    abstract getName(): string;
    getEntity(throwIfInvalid: true): Entity;
    getEntity(throwIfInvalid?: false): Entity | undefined;
    getPlayer(throwIfInvalid: true): Player;
    getPlayer(throwIfInvalid?: false): Player | undefined;
    getBlock(throwIfInvalid: true): Block;
    getBlock(throwIfInvalid?: false): Block | undefined;
    getInitiator(throwIfInvalid: true): Entity;
    getInitiator(throwIfInvalid?: false): Entity | undefined;
    isServer(): this is ServerCommandOrigin;
    isPlayer(): this is PlayerCommandOrigin;
    isSendable(): this is SendableOrigin;
    isLocatable(): this is LocatableOrigin;
}
interface SendableOrigin {
    sendMessage(message: string): void;
}
interface LocatableOrigin {
    getLocation(throwIfInvalid: boolean): Vector3 | undefined;
    getDimension(throwIfInvalid: boolean): Dimension | undefined;
}
declare class ServerCommandOrigin extends CommandOrigin implements SendableOrigin {
    getName(): string;
    sendMessage(message: string): void;
}
declare class BlockCommandOrigin extends CommandOrigin implements LocatableOrigin {
    getName(): string;
    getLocation(): Vector3;
    getDimension(): Dimension;
}
declare class EntityCommandOrigin extends CommandOrigin implements LocatableOrigin {
    getName(): string;
    getLocation(): Vector3;
    getDimension(): Dimension;
}
declare class NPCCommandOrigin extends EntityCommandOrigin {
    getName(): string;
}
declare class PlayerCommandOrigin extends EntityCommandOrigin implements SendableOrigin {
    getName(): string;
    sendMessage(message: string): void;
}

//#endregion
//#region src/handler.d.ts
type NamespacedString = `${string}:${string}`;
interface Command {
    name: NamespacedString;
    description: string;
    permission: CommandPermissionLevel | ((origin: CommandOrigin) => boolean | {
        error: string;
    });
    aliases?: string[];
}
interface ParamTypeMap {
    [CustomCommandParamType.Boolean]: boolean;
    [CustomCommandParamType.Integer]: number;
    [CustomCommandParamType.Float]: number;
    [CustomCommandParamType.String]: string;
    [CustomCommandParamType.EntitySelector]: Entity[];
    [CustomCommandParamType.PlayerSelector]: Player[];
    [CustomCommandParamType.Location]: Vector3;
    [CustomCommandParamType.BlockType]: BlockType;
    [CustomCommandParamType.ItemType]: ItemType;
}
type ParamType = CommandEnum | keyof ParamTypeMap;
type CommandParams = Record<string, ParamType | [ParamType]>;
type GetParamValue<T extends ParamType> = T extends CommandEnum<infer V> ? V : T extends keyof ParamTypeMap ? ParamTypeMap[T] : never;
type CommandCallback<PARAMS extends CommandParams> = (params: {
    [K in keyof PARAMS]: PARAMS[K] extends [infer T] ? T extends ParamType ? GetParamValue<T> | undefined : never : PARAMS[K] extends ParamType ? GetParamValue<PARAMS[K]> : never;
}, origin: CommandOrigin) => CustomCommandResult | CustomCommandStatus;
interface CommandRegistrationData {
    command: Command;
    callback: CommandCallback<CommandParams>;
    params: CommandParams;
}
declare class CommandHandler {
    readonly commands: Set<CommandRegistrationData>;
    readonly enums: Map<string, CommandEnum<string | number>>;
    readonly options: {
        /** Show output message even if `sendcommandfeedback` is set false */
        alwaysShowMessage: boolean;
        customPermissionError: string;
    };
    constructor();
    private onStartup;
    register<PARAMS extends CommandParams>(command: Command, callback: CommandCallback<PARAMS>, params: PARAMS): CommandRegistrationData;
    createEnum<const T extends string[]>(name: NamespacedString, values: T): CommandEnum<T[number]>;
    createEnum<T extends Record<string, string | number>>(name: NamespacedString, values: T): CommandEnum<T[keyof T]>;
}
declare const commandHandler: CommandHandler;
declare const createEnum: {
    <const T extends string[]>(name: NamespacedString, values: T): CommandEnum<T[number]>;
    <T extends Record<string, string | number>>(name: NamespacedString, values: T): CommandEnum<T[keyof T]>;
};

//#endregion
//#region src/utils.d.ts
declare const success: (message?: string) => CustomCommandResult;
declare const failure: (message?: string) => CustomCommandResult;

//#endregion
export { BlockCommandOrigin, Command, CommandCallback, CommandEnum, CommandHandler, CommandOrigin, CommandRegistrationData, EntityCommandOrigin, NPCCommandOrigin, ParamTypeMap, PlayerCommandOrigin, ServerCommandOrigin, commandHandler, createEnum, failure, success };