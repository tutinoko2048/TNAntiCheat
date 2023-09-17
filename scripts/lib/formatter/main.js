const noColor = false;
const defaultOptions = {
    maxDepth: Infinity,
    lineLength: 40,
    arrayIndex: true,
    hideFunction: false,
};
const f = {
    string: (v) => `§6"${v}"§r`,
    number: (v) => `§a${v}§r`,
    boolean: (v) => `§s${v}§r`,
    'null': () => `§7null§r`,
    'undefined': () => `§7undefined§r`,
    'class': (v) => `§g[class ${v.name}]§r`,
    'function': (v) => `§5§oƒ§r §e${v.name ?? ''}()§r`,
    'constructor': (v) => `§l§7${v}§r`,
    'index': (v) => `§7${v}§r`,
    circular: () => '§c[Circular]§r',
    omission: () => '§7...§r'
};
class Formatter {
    options;
    stack;
    constructor(options) {
        this.options = { ...defaultOptions, ...options };
        this.stack = [];
    }
    static format(value, options) {
        const formatter = new this(options);
        return formatter.run(value, '', 1);
    }
    run(value, result, step) {
        const nextLine = () => '\n';
        const indent = (s) => ' '.repeat(2 * s);
        const bracket = (b) => step % 2 ? `§e${b}§r` : `§d${b}§r`;
        const startBracket = (b, line) => result += (line ? nextLine() : '') + bracket(b);
        const endBracket = (b, line) => result += (line ? `${nextLine()}${indent(step - 1)}` : '') + bracket(b);
        if (typeof value === 'string')
            return result += f.string(value);
        if (typeof value === 'number')
            return result += f.number(value);
        if (typeof value === 'boolean')
            return result += f.boolean(value);
        if (typeof value === 'function') {
            if (isClass(value))
                return result += f.class(value);
            else
                return result += f.function(value);
        }
        if (typeof value === 'undefined')
            return result += f.undefined();
        if (value === null)
            return result += f.null();
        if (isObject(value)) {
            for (const _value of this.stack) {
                if (_value === value)
                    return result += f.circular();
            }
            if (value.__proto__)
                result += f.constructor(value.__proto__.constructor.name) + ' ';
            startBracket('{');
            let short;
            if (step >= this.options.maxDepth) {
                result += ` ${f.omission()} `;
                short = true;
            }
            else {
                this.stack.push(value);
                const entries = [];
                for (const key in value) {
                    const v = value[key];
                    if (!this.options.hideFunction && typeof v === 'function')
                        continue;
                    const formatted = this.run(v, '', step + 1);
                    const k = key.match(/\.|\//) ? `"${key}"` : key;
                    entries.push(`${k}: ${formatted}`);
                }
                short = entries.reduce((a, b) => a + b.length, 0) < this.options.lineLength;
                result += short
                    ? (entries.length > 0 ? ` ${entries.join(', ')} ` : '')
                    : `\n${indent(step)}` + entries.join(',\n' + indent(step));
                this.stack.pop();
            }
            endBracket('}', !short);
            return result;
        }
        if (Array.isArray(value)) {
            for (const _value of this.stack) {
                if (_value === value)
                    return result += f.circular();
            }
            result += f.constructor(`Array(${value.length}) `);
            startBracket('[');
            let short;
            if (step >= this.options.maxDepth) {
                result += ` ${f.omission()} `;
                short = true;
            }
            else {
                this.stack.push(value);
                const entries = [];
                for (const index in value) {
                    const v = value[index];
                    if (!this.options.hideFunction && typeof v === 'function')
                        continue;
                    const formatted = this.run(v, '', step + 1);
                    entries.push((this.options.arrayIndex ? `${f.index(index)}: ` : '') + formatted);
                }
                short = entries.reduce((a, b) => a + b.length, 0) < this.options.lineLength;
                result += short
                    ? (entries.length > 0 ? ` ${entries.join(', ')} ` : '')
                    : `\n${indent(step)}` + entries.join(',\n' + indent(step));
                this.stack.pop();
            }
            endBracket(']', !short);
            return result;
        }
        return String(value);
    }
}
function isClass(obj) {
    return obj.toString().startsWith("class ");
}
function isObject(obj) {
    return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
export function format(value, options) {
    const res = Formatter.format(value, options);
    return noColor ? res.replace(/§./g, '') : res;
}
