// gametest-utility-library https://github.com/Lapis256/gametest-utility-library/blob/main/src/debug/toJson.js

function isClass(obj) {
    return obj.toString().startsWith("class ");
}

function isGenerator(obj) {
    return obj[Symbol.iterator] &&
           obj[Symbol.iterator].name === "[Symbol.iterator]" &&
           typeof obj.next === "function";
}

export default function toJson(data, indent = 2, ignoreFunction = false) {
    return JSON.stringify(data, (key, value) => {
        switch(typeof value) {
            case "function":
                if (ignoreFunction) break;
                if(isClass(value)) {
                    return `§e[class ${value.name || key}]§r`;
                }
                return `§e[function ${value.name || key}]§r`;
            
            case "object":
                if(isGenerator(value)) {
                    return `§e[generator ${key || "Generator"}]`;
                }
                if(Array.isArray(value)) {
                    return value;
                }
                let obj = {};
                for(const i in value) {
                    obj[i] = value[i];
                }
                return obj;
            
            case "undefined":
                return null;
            
            case "string":
                return `§a${value}§r`
            
            default:
                return value;
        }
    }, indent).replace(/(true|false|\d+|-\d+)/g, '§b$1§r').replace(/(\{|\})/g, '§6$1§r');
}