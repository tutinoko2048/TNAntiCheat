/** command-handler v10 **/
import { CommandPermissionLevel, CustomCommandParamType, CustomCommandSource, CustomCommandStatus, Player, system, world } from "@minecraft/server";

//#region src/enum.ts
var CommandEnum = class {
	constructor(name, values) {
		this.name = name;
		this.values = values;
	}
	getValue(name) {
		const parsedValue = this.values[name];
		if (parsedValue === void 0) throw new Error(`Invalid value "${name}" passed for enum "${this.name}"`);
		return parsedValue;
	}
};

//#endregion
//#region src/origin.ts
var CommandOrigin = class {
	constructor(origin) {
		this.origin = origin;
	}
	getEntity(throwIfInvalid = false) {
		const entity = this.origin.sourceEntity;
		if (throwIfInvalid && !entity) throw new Error("Failed to get entity from command origin");
		return entity;
	}
	getPlayer(throwIfInvalid = false) {
		const player = this.getEntity(throwIfInvalid);
		if (player instanceof Player) return player;
		else if (throwIfInvalid) throw new Error("Failed to get player from command origin");
		else return void 0;
	}
	getBlock(throwIfInvalid = false) {
		const block = this.origin.sourceBlock;
		if (throwIfInvalid && !block) throw new Error("Failed to get block from command origin");
		return block;
	}
	getInitiator(throwIfInvalid = false) {
		const entity = this.origin.initiator;
		if (throwIfInvalid && !entity) throw new Error("Failed to get initiator from command origin");
		return entity;
	}
	isServer() {
		return this.origin.sourceType === CustomCommandSource.Server;
	}
	isPlayer() {
		return !!this.getPlayer();
	}
	isSendable() {
		return this.isServer() || this.isPlayer();
	}
	isLocatable() {
		return !!this.getEntity() || !!this.getBlock();
	}
};
var ServerCommandOrigin = class extends CommandOrigin {
	getName() {
		return "Server";
	}
	sendMessage(message) {
		console.log(message);
	}
};
var BlockCommandOrigin = class extends CommandOrigin {
	getName() {
		return "Block";
	}
	getLocation() {
		return this.getBlock(true).location;
	}
	getDimension() {
		return this.getBlock(true).dimension;
	}
};
var EntityCommandOrigin = class extends CommandOrigin {
	getName() {
		return this.getEntity(true).nameTag || "Entity";
	}
	getLocation() {
		return this.getEntity(true).location;
	}
	getDimension() {
		return this.getEntity(true).dimension;
	}
};
var NPCCommandOrigin = class extends EntityCommandOrigin {
	getName() {
		return this.getEntity(true).nameTag || "NPC";
	}
};
var PlayerCommandOrigin = class extends EntityCommandOrigin {
	getName() {
		return this.getPlayer(true).name;
	}
	sendMessage(message) {
		const player = this.getPlayer(true);
		player.sendMessage(message);
	}
};

//#endregion
//#region src/utils.ts
const success = (message) => ({
	status: CustomCommandStatus.Success,
	message
});
const failure = (message) => ({
	status: CustomCommandStatus.Failure,
	message
});

//#endregion
//#region src/handler.ts
var CommandHandler = class {
	commands = /* @__PURE__ */ new Set();
	enums = /* @__PURE__ */ new Map();
	options = {
		alwaysShowMessage: true,
		customPermissionError: "You do not have permission to execute this command."
	};
	constructor() {
		system.beforeEvents.startup.subscribe(this.onStartup.bind(this));
	}
	onStartup(event) {
		const registry = event.customCommandRegistry;
		for (const { name, values } of this.enums.values()) registry.registerEnum(name, enumKeys(values));
		for (const { command, callback, params } of this.commands) {
			const paramEntries = Object.entries(params);
			const mandatoryParams = [];
			const optionalParams = [];
			let optionalRegistered = false;
			for (const [key, paramType] of paramEntries) {
				const isOptional = Array.isArray(paramType);
				const param = isOptional ? paramType[0] : paramType;
				const paramList = isOptional ? optionalParams : mandatoryParams;
				if (param instanceof CommandEnum) paramList.push({
					name: param.name,
					type: CustomCommandParamType.Enum
				});
				else paramList.push({
					name: key,
					type: param
				});
				if (isOptional && !optionalRegistered) optionalRegistered = true;
				else if (!isOptional && optionalRegistered) throw new Error(`Mandatory parameters must be registered before optional ones`);
			}
			const commandCallback = (_origin, ...params$1) => {
				let origin;
				switch (_origin.sourceType) {
					case CustomCommandSource.Server:
						origin = new ServerCommandOrigin(_origin);
						break;
					case CustomCommandSource.Entity:
						if (_origin.sourceEntity instanceof Player) origin = new PlayerCommandOrigin(_origin);
						else origin = new EntityCommandOrigin(_origin);
						break;
					case CustomCommandSource.Block:
						origin = new BlockCommandOrigin(_origin);
						break;
					case CustomCommandSource.NPCDialogue:
						origin = new NPCCommandOrigin(_origin);
						break;
					default: throw new Error(`Unknown command origin type: ${_origin.sourceType}`);
				}
				if (typeof command.permission === "function") {
					const customPermissionResult = command.permission(origin);
					if (customPermissionResult !== true) return failure(typeof customPermissionResult === "boolean" ? this.options.customPermissionError : customPermissionResult.error);
				}
				const parsedParams = {};
				for (const [i, paramInput] of params$1.entries()) {
					const paramEntry = paramEntries[i];
					if (!paramEntry) throw new Error(`Invalid parameter provided at [${i}]: ${paramInput}`);
					const [key, paramType] = paramEntry;
					if (paramType instanceof CommandEnum) parsedParams[key] = paramType.getValue(paramInput);
					else parsedParams[key] = paramInput;
				}
				const result = callback(parsedParams, origin);
				const onResult = (r) => {
					if (r.status === CustomCommandStatus.Success && r.message && this.options.alwaysShowMessage && !world.gameRules.sendCommandFeedback && origin instanceof PlayerCommandOrigin) origin.sendMessage("§r§f" + r.message);
					return r;
				};
				return onResult(typeof result === "number" ? { status: result } : result);
			};
			registry.registerCommand({
				name: command.name,
				description: command.description,
				permissionLevel: typeof command.permission === "function" ? CommandPermissionLevel.Any : command.permission,
				mandatoryParameters: mandatoryParams,
				optionalParameters: optionalParams
			}, commandCallback);
			for (const alias of command.aliases ?? []) registry.registerCommand({
				name: alias.includes(":") ? alias : `${command.name.split(":")[0]}:${alias}`,
				description: command.description,
				permissionLevel: typeof command.permission === "function" ? CommandPermissionLevel.Any : command.permission,
				mandatoryParameters: mandatoryParams,
				optionalParameters: optionalParams
			}, commandCallback);
		}
	}
	register(command, callback, params) {
		const data = {
			command,
			callback,
			params
		};
		this.commands.add(data);
		return data;
	}
	createEnum(name, values) {
		if (this.enums.has(name)) throw new Error(`Enum ${name} is already registered`);
		const enumValues = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
		const commandEnum = new CommandEnum(name, enumValues);
		this.enums.set(name, commandEnum);
		return commandEnum;
	}
};
function enumKeys(e) {
	return Object.keys(e).filter((k) => isNaN(Number(k)));
}
const commandHandler = new CommandHandler();
const createEnum = commandHandler.createEnum.bind(commandHandler);

//#endregion
export { BlockCommandOrigin, CommandEnum, CommandHandler, CommandOrigin, EntityCommandOrigin, NPCCommandOrigin, PlayerCommandOrigin, ServerCommandOrigin, commandHandler, createEnum, failure, success };