/*! timer.js v1.1 | MIT license | https://github.com/Lapis256/timer.js/blob/main/LICENSE */

import { world } from "mojang-minecraft";


class Timer {
    currentTick = 1;

    constructor(callback, interval, once, args) {
        this.callback = callback.bind(null, ...args);
        this.interval = interval;
        this.once = once;
    }
}

class Handler {
    currentID = 0;
    timers = new Map();

    constructor() {
        world.events.tick.subscribe(() => this.tick());
    }

    addTimer(callback, interval, once, args) {
        const id = this.currentID++;
        this.timers.set(id, new Timer(callback, interval, once, args));
        return id;
    }

    deleteTimer(id) {
        this.timers.delete(id);
    }

    tick() {
        this.timers.forEach((timer, id) => {
            if(timer.currentTick++ % timer.interval !== 0) return;

            if(timer.once) this.deleteTimer(id);
            timer.callback();
        });
    }
}

void function() {
    const handler = new Handler();

    globalThis.setInterval = function(callback, interval, ...args) {
        return handler.addTimer(callback, interval, false, args);
    }
    globalThis.clearInterval = function(id) {
        handler.deleteTimer(id);
    }

    globalThis.setTimeout = function(callback, interval, ...args) {
        return handler.addTimer(callback, interval, true, args);
    }
    globalThis.clearTimeout = function(id) {
        handler.deleteTimer(id);
    }
}();
