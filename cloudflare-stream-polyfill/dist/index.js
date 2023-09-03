export class EventEmitter {
    constructor() {
        this.eventListeners = [];
    }
    ;
    addListener(eventName, listener) {
        this.eventListeners.push({
            eventName,
            callback: listener,
            once: false
        });
        return this;
    }
    ;
    on(eventName, listener) {
        return this.addListener(eventName, listener);
    }
    ;
    once(eventName, listener) {
        this.eventListeners.push({
            eventName,
            callback: listener,
            once: true
        });
        return this;
    }
    ;
    removeListener(eventName, listener) {
        this.eventListeners = this.eventListeners.filter((eventListener) => eventListener.eventName !== eventName && eventListener.callback !== listener);
        return this;
    }
    ;
    off(eventName, listener) {
        return this.removeListener(eventName, listener);
    }
    ;
    removeAllListeners(event) {
        this.eventListeners = [];
        return this;
    }
    ;
    setMaxListeners(n) {
        throw new Error('Method not implemented.');
    }
    ;
    getMaxListeners() {
        throw new Error('Method not implemented.');
    }
    ;
    listeners(eventName) {
        throw new Error('Method not implemented.');
    }
    ;
    rawListeners(eventName) {
        throw new Error('Method not implemented.');
    }
    ;
    emit(eventName, ...args) {
        const eventListeners = this.eventListeners
            .filter((eventListener) => eventListener.eventName === eventName);
        if (!eventListeners.length)
            return false;
        eventListeners.forEach((eventListener) => {
            eventListener.callback(...args);
        });
        return true;
    }
    ;
    listenerCount(eventName, listener) {
        throw new Error('Method not implemented.');
    }
    ;
    prependListener(eventName, listener) {
        throw new Error('Method not implemented.');
    }
    ;
    prependOnceListener(eventName, listener) {
        throw new Error('Method not implemented.');
    }
    ;
    eventNames() {
        throw new Error('Method not implemented.');
    }
    ;
}
;
export default class Stream extends EventEmitter {
    constructor(options = {}) {
        super();
        this.options = options;
    }
    ;
    pipe(destination, options) {
        throw new Error('Method not implemented.');
    }
    ;
    compose(stream, options) {
        throw new Error('Method not implemented.');
    }
    ;
}
;
//# sourceMappingURL=index.js.map