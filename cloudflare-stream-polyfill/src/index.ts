export class EventEmitter {
  private eventListeners: { eventName: string | symbol, callback: Function, once: boolean }[] = [];

  constructor() {

  };
  
  addListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.eventListeners.push({
      eventName,
      callback: listener,
      once: false
    });

    return this;
  };

  on(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return this.addListener(eventName, listener);
  };

  once(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.eventListeners.push({
      eventName,
      callback: listener,
      once: true
    });

    return this;
  };

  removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    this.eventListeners = this.eventListeners.filter((eventListener) => eventListener.eventName !== eventName && eventListener.callback !== listener);
    
    return this;
  };

  off(eventName: string | symbol, listener: (...args: any[]) => void): this {
    return this.removeListener(eventName, listener);
  };

  removeAllListeners(event?: string | symbol | undefined): this {
    this.eventListeners = [];

    return this;
  };

  setMaxListeners(n: number): this {
    throw new Error('Method not implemented.');
  };

  getMaxListeners(): number {
    throw new Error('Method not implemented.');
  };

  listeners(eventName: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  };

  rawListeners(eventName: string | symbol): Function[] {
    throw new Error('Method not implemented.');
  };

  emit(eventName: string | symbol, ...args: any[]): boolean {
    const eventListeners = this.eventListeners
      .filter((eventListener) => eventListener.eventName === eventName);

    if(!eventListeners.length)
      return false;

    eventListeners.forEach((eventListener) => {
      eventListener.callback(...args);
    });

    return true;
  };

  listenerCount(eventName: string | symbol, listener?: Function | undefined): number {
    throw new Error('Method not implemented.');
  };

  prependListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  };

  prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): this {
    throw new Error('Method not implemented.');
  };

  eventNames(): (string | symbol)[] {
    throw new Error('Method not implemented.');
  };
};

export type ReadableOptions = {

};

export default class Stream extends EventEmitter {
  constructor(private options: ReadableOptions = {}) {
    super();
  };
  
  pipe<T extends WritableStream>(destination: T, options?: { end?: boolean | undefined; } | undefined): T {
    throw new Error('Method not implemented.');
  };
  
  compose<T extends ReadableStream>(stream: T | ((source: any) => void) | Iterable<T> | AsyncIterable<T>, options?: { signal: AbortSignal; } | undefined): T {
    throw new Error('Method not implemented.');
  };
};
