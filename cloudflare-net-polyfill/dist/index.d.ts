/// <reference types="@cloudflare/workers-types" />
declare class Buffer {
}
import { EventEmitter } from "cloudflare-stream-polyfill";
export type AbortSignal = {};
export type SocketOptions = {
    fd?: number;
    allowHalfOpen?: boolean;
    readable?: boolean;
    writable?: boolean;
    signal?: AbortSignal;
};
export type SocketConnectOptions = {
    port: number;
    host: string;
};
export type SocketEventListener = {
    once: boolean;
    event: string;
    callback: Function;
};
export type SocketTimeoutOptions = {
    duration?: number;
    callback?: Function;
};
export declare class Socket extends EventEmitter {
    private cloudflareSocket?;
    private cloudflareSocketReader?;
    private cloudflareSocketWriter?;
    private timeout;
    private timeoutId?;
    private readonly options;
    constructor(options?: SocketOptions);
    connect(options: SocketConnectOptions, connectListener?: ((...args: any[]) => void)): Socket;
    connect(port: number, host: string, connectListener?: ((...args: any[]) => void)): Socket;
    startTls(): void;
    pipe(destination: WritableStream<any>): void;
    private _currentReadData;
    private _read;
    pause(): void;
    resume(): void;
    end(): void;
    destroy(): void;
    write(data: string | Buffer | Uint16Array, encoding: string | undefined, callback: Function): boolean;
    setTimeout(timeout: number, callback?: Function): Socket;
    private _resetTimeout;
}
export default class Net {
    static createConnection(port: number, host?: string, connectListener?: ((...args: any[]) => void)): Socket;
}
export {};
//# sourceMappingURL=index.d.ts.map