import { connect } from 'cloudflare:sockets';
;
import { EventEmitter } from "cloudflare-stream-polyfill";
export class Socket extends EventEmitter {
    constructor(options = {}) {
        super();
        this.timeout = {};
        this._currentReadData = [];
        this.options = options;
    }
    ;
    connect(...args) {
        if (typeof args[0] !== "object") {
            const [port, host, connectListener] = args;
            return this.connect({ port, host }, connectListener);
        }
        const [options, connectListener] = args;
        console.log("Connect with", JSON.stringify(options));
        if (connectListener)
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
    }
    ;
    startTls() {
        this.cloudflareSocketWriter?.releaseLock();
        this.cloudflareSocketReader?.releaseLock();
        this.cloudflareSocket?.startTls();
        this.emit("secure");
    }
    ;
    pipe(destination) {
        this.cloudflareSocket?.readable.pipeTo(destination);
    }
    ;
    _read() {
        this.cloudflareSocketReader?.read().then((data) => {
            console.log("reading data");
            console.log(JSON.stringify(data));
            this._resetTimeout();
            if (!data.done) {
                this.emit("data", data.value);
                this._read();
            }
            else {
                console.log("reader is done");
            }
        }).catch((error) => console.error(error));
    }
    ;
    pause() {
        console.info("Pause does nothing.");
    }
    ;
    resume() {
        console.info("Resume does nothing.");
    }
    ;
    end() {
        console.debug("end");
        this.cloudflareSocket?.close();
    }
    ;
    destroy() {
        console.debug("destroy");
        this.cloudflareSocket?.close();
    }
    ;
    write(data, encoding = "utf8", callback) {
        this._resetTimeout();
        console.log("write", JSON.stringify(data));
        this.cloudflareSocketWriter?.write(data).then(() => callback());
        return true;
    }
    ;
    setTimeout(timeout, callback) {
        console.debug("setTimeout", JSON.stringify({ timeout }));
        this.timeout = {
            duration: timeout,
            callback
        };
        this._resetTimeout();
        return this;
    }
    ;
    _resetTimeout() {
        if (this.timeoutId !== undefined) {
            clearTimeout(this.timeoutId);
            this.timeoutId = undefined;
        }
        if (this.timeout.duration && this.timeout.duration > 0) {
            this.timeoutId = setTimeout(() => {
                console.log("wants to timeout");
                this.timeout.callback?.();
                this.emit("timeout");
            }, this.timeout.duration);
        }
    }
    ;
}
;
export default class Net {
    static createConnection(port, host = "localhost", connectListener) {
        const socket = new Socket();
        return socket.connect(port, host, connectListener);
    }
    ;
}
;
//# sourceMappingURL=index.js.map