import { connect } from 'cloudflare:sockets';

declare class Buffer {};
declare type BufferEncoding = string;

import CloudflareSocket from './interfaces/CloudflareSocket';
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
  once: boolean,
  event: string,
  callback: Function
};

export type SocketTimeoutOptions = {
  duration?: number;
  callback?: Function;
};

export class Socket extends EventEmitter {
  private cloudflareSocket?: CloudflareSocket;
  private cloudflareSocketReader?: ReadableStreamDefaultReader<any>;
  private cloudflareSocketWriter?: WritableStreamDefaultWriter<any>;
  private timeout: SocketTimeoutOptions = {};
  private timeoutId?: number;

  private readonly options: SocketOptions;

  constructor(options: SocketOptions = {}) {
    super();
    
    this.options = options;
  };

  connect(options: SocketConnectOptions, connectListener?: ((...args: any[]) => void)): Socket;
  connect(port: number, host: string, connectListener?: ((...args: any[]) => void)): Socket;
  connect(...args: any): Socket {
    if(typeof args[0] !== "object") {
      const [ port, host, connectListener ]: [ number, string, ((...args: any[]) => void) ] = args;

      return this.connect({ port, host }, connectListener);
    }

    const [ options, connectListener ]: [ SocketConnectOptions, ((...args: any[]) => void) ] = args;

    console.log("Connect with", JSON.stringify(options));

    if(connectListener)
      this.once("connect", connectListener);

    this.cloudflareSocket = connect({
      hostname: options.host,
      port: options.port
    }, {
      allowHalfOpen: this.options.allowHalfOpen ?? false,
      secureTransport: "starttls"
    });

    this.cloudflareSocketReader = this.cloudflareSocket?.readable.getReader();
    this.cloudflareSocketWriter = this.cloudflareSocket?.writable.getWriter();

    this.emit("connect");
  
    this._read();

    return this;
  };

  startTls() {
    this.cloudflareSocketWriter?.releaseLock();
    this.cloudflareSocketReader?.releaseLock();

    this.cloudflareSocket?.startTls();

    this.emit("secure");
  };

  pipe(destination: WritableStream<any>) {
    this.cloudflareSocket?.readable.pipeTo(destination);
  };

  private _currentReadData: any[] = [];

  private _read() {
    this.cloudflareSocketReader?.read().then((data) => {
      console.log("reading data");
      console.log(JSON.stringify(data));
    
      this._resetTimeout();
      
      if(!data.done) {
        this.emit("data", data.value);

        this._read();
      }
      else {
        console.log("reader is done");
      }
    }).catch((error) => console.error(error));
  };

  pause() {
    console.info("Pause does nothing.");
  };

  resume() {
    console.info("Resume does nothing.");
  };

  end() {
    console.debug("end");
    
    this.cloudflareSocket?.close();
  };

  destroy() {
    console.debug("destroy");

    this.cloudflareSocket?.close();
  };

  write(data: string | Buffer | Uint16Array, encoding: BufferEncoding = "utf8", callback: Function): boolean {
    this._resetTimeout();

    console.log("write", JSON.stringify(data));

    this.cloudflareSocketWriter?.write(data).then(() => callback());

    return true;
  };

  setTimeout(timeout: number, callback?: Function): Socket {
    console.debug("setTimeout", JSON.stringify({ timeout }));

    this.timeout = {
      duration: timeout,
      callback
    };

    this._resetTimeout();

    return this;
  };

  private _resetTimeout() {
    if(this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);

      this.timeoutId = undefined;
    }

    if(this.timeout.duration && this.timeout.duration > 0) {
      this.timeoutId = setTimeout(() => {        
        console.log("wants to timeout");
        
        this.timeout.callback?.();

        this.emit("timeout");
      }, this.timeout.duration);
    }
  };
};

export default class Net {
  static createConnection(port: number, host: string = "localhost", connectListener?: ((...args: any[]) => void)) {
    const socket = new Socket();

    return socket.connect(port, host, connectListener);
  };
};
