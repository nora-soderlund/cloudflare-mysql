/// <reference types="@cloudflare/workers-types" />
export default interface CloudflareSocket {
    get readable(): ReadableStream;
    get writable(): WritableStream;
    get closed(): Promise<void>;
    close(): Promise<void>;
    startTls(options?: TlsOptions): Socket;
}
//# sourceMappingURL=CloudflareSocket.d.ts.map