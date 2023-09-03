/// <reference types="@cloudflare/workers-types" />
export declare class EventEmitter {
    private eventListeners;
    constructor();
    addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    off(eventName: string | symbol, listener: (...args: any[]) => void): this;
    removeAllListeners(event?: string | symbol | undefined): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    listeners(eventName: string | symbol): Function[];
    rawListeners(eventName: string | symbol): Function[];
    emit(eventName: string | symbol, ...args: any[]): boolean;
    listenerCount(eventName: string | symbol, listener?: Function | undefined): number;
    prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
    eventNames(): (string | symbol)[];
}
export type ReadableOptions = {};
export default class Stream extends EventEmitter {
    private options;
    constructor(options?: ReadableOptions);
    pipe<T extends WritableStream>(destination: T, options?: {
        end?: boolean | undefined;
    } | undefined): T;
    compose<T extends ReadableStream>(stream: T | ((source: any) => void) | Iterable<T> | AsyncIterable<T>, options?: {
        signal: AbortSignal;
    } | undefined): T;
}
//# sourceMappingURL=index.d.ts.map