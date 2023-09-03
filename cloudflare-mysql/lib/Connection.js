import Crypto from "crypto";
import ConnectionConfig from "./ConnectionConfig";
import Protocol from "./protocol/Protocol";
import SqlString from "./protocol/SqlString";
import Query from "./protocol/sequences/Query";

import Net from "cloudflare-net-polyfill";
import { EventEmitter } from "cloudflare-stream-polyfill";

export default class Connection extends EventEmitter {
  constructor(options) {
    super();

    this.config = options.config;

    this._socket        = options.socket;
    this._protocol      = new Protocol({config: this.config, connection: this});
    this._connectCalled = false;
    this.state          = 'disconnected';
    this.threadId       = null;
  };

  static createQuery(sql, values, callback) {
    if (sql instanceof Query) {
      return sql;
    }

    var cb      = callback;
    var options = {};

    if (typeof sql === 'function') {
      cb = sql;
    } else if (typeof sql === 'object') {
      options = Object.create(sql);

      if (typeof values === 'function') {
        cb = values;
      } else if (values !== undefined) {
        Object.defineProperty(options, 'values', { value: values });
      }
    } else {
      options.sql = sql;

      if (typeof values === 'function') {
        cb = values;
      } else if (values !== undefined) {
        options.values = values;
      }
    }

    if (cb !== undefined) {
      cb = wrapCallbackInDomain(null, cb);

      if (cb === undefined) {
        throw new TypeError('argument callback must be a function when provided');
      }
    }

    return new Query(options, cb);
  };

  connect(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (!this._connectCalled) {
      this._connectCalled = true;

      // Connect either via a UNIX domain socket or a TCP socket.
      this._socket = (this.config.socketPath)
        ? Net.createConnection(this.config.socketPath)
        : Net.createConnection(this.config.port, this.config.host);

      // Connect socket to connection domain
      // if (Events.usingDomains) {
      //   this._socket.domain = this.domain;
      // }

      var connection = this;
      this._protocol.on('data', function(data) {
        connection._socket.write(data);
      });
      this._socket.on('data', wrapToDomain(connection, function (data) {
        connection._protocol.write(data);
      }));
      this._protocol.on('end', function() {
        connection._socket.end();
      });
      this._socket.on('end', wrapToDomain(connection, function () {
        connection._protocol.end();
      }));

      this._socket.on('error', this._handleNetworkError.bind(this));
      this._socket.on('connect', this._handleProtocolConnect.bind(this));
      this._protocol.on('handshake', this._handleProtocolHandshake.bind(this));
      this._protocol.on('initialize', this._handleProtocolInitialize.bind(this));
      this._protocol.on('unhandledError', this._handleProtocolError.bind(this));
      this._protocol.on('drain', this._handleProtocolDrain.bind(this));
      this._protocol.on('end', this._handleProtocolEnd.bind(this));
      this._protocol.on('enqueue', this._handleProtocolEnqueue.bind(this));

      if (this.config.connectTimeout) {
        var handleConnectTimeout = this._handleConnectTimeout.bind(this);

        this._socket.setTimeout(this.config.connectTimeout, handleConnectTimeout);
        this._socket.once('connect', function() {
          this.setTimeout(0, handleConnectTimeout);
        });
      }
    }

    this._protocol.handshake(options, wrapCallbackInDomain(this, callback));
  };

  changeUser(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    this._implyConnect();

    var charsetNumber = (options.charset)
      ? ConnectionConfig.getCharsetNumber(options.charset)
      : this.config.charsetNumber;

    return this._protocol.changeUser({
      user          : options.user || this.config.user,
      password      : options.password || this.config.password,
      database      : options.database || this.config.database,
      timeout       : options.timeout,
      charsetNumber : charsetNumber,
      currentConfig : this.config
    }, wrapCallbackInDomain(this, callback));
  };

  beginTransaction(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};
    options.sql = 'START TRANSACTION';
    options.values = null;

    return this.query(options, callback);
  };

  commit(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};
    options.sql = 'COMMIT';
    options.values = null;

    return this.query(options, callback);
  };

  rollback(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    options = options || {};
    options.sql = 'ROLLBACK';
    options.values = null;

    return this.query(options, callback);
  };

  query(sql, values, cb) {
    var query = Connection.createQuery(sql, values, cb);
    query._connection = this;

    if (!(typeof sql === 'object' && 'typeCast' in sql)) {
      query.typeCast = this.config.typeCast;
    }

    if (query.sql) {
      query.sql = this.format(query.sql, query.values);
    }

    if (query._callback) {
      query._callback = wrapCallbackInDomain(this, query._callback);
    }

    this._implyConnect();

    return this._protocol._enqueue(query);
  };

  ping(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    this._implyConnect();
    this._protocol.ping(options, wrapCallbackInDomain(this, callback));
  };

  statistics(options, callback) {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = {};
    }

    this._implyConnect();
    this._protocol.stats(options, wrapCallbackInDomain(this, callback));
  };

  end(options, callback) {
    var cb   = callback;
    var opts = options;

    if (!callback && typeof options === 'function') {
      cb   = options;
      opts = null;
    }

    // create custom options reference
    opts = Object.create(opts || null);

    if (opts.timeout === undefined) {
      // default timeout of 30 seconds
      opts.timeout = 30000;
    }

    this._implyConnect();
    this._protocol.quit(opts, wrapCallbackInDomain(this, cb));
  };

  destroy() {
    this.state = 'disconnected';
    this._implyConnect();
    this._socket.destroy();
    this._protocol.destroy();
  };

  pause() {
    this._socket.pause();
    this._protocol.pause();
  };

  resume() {
    this._socket.resume();
    this._protocol.resume();
  };

  escape(value) {
    return SqlString.escape(value, false, this.config.timezone);
  };

  escapeId(value) {
    return SqlString.escapeId(value, false);
  };

  format(sql, values) {
    if (typeof this.config.queryFormat === 'function') {
      return this.config.queryFormat.call(this, sql, values, this.config.timezone);
    }
    return SqlString.format(sql, values, this.config.stringifyObjects, this.config.timezone);
  };

  _startTLS(onSecure) {
    this._socket.startTls();

    onSecure();
  };

  _handleConnectTimeout() {
    if (this._socket) {
      this._socket.setTimeout(0);
      this._socket.destroy();
    }

    var err = new Error('connect ETIMEDOUT');
    err.errorno = 'ETIMEDOUT';
    err.code = 'ETIMEDOUT';
    err.syscall = 'connect';

    this._handleNetworkError(err);
  };

  _handleNetworkError(err) {
    this._protocol.handleNetworkError(err);
  };

  _handleProtocolError(err) {
    this.state = 'protocol_error';
    this.emit('error', err);
  };

  _handleProtocolDrain() {
    this.emit('drain');
  };

  _handleProtocolConnect() {
    this.state = 'connected';
    this.emit('connect');
  };

  _handleProtocolHandshake() {
    this.state = 'authenticated';
  };

  _handleProtocolInitialize(packet) {
    this.threadId = packet.threadId;
  };

  _handleProtocolEnd(err) {
    this.state = 'disconnected';
    this.emit('end', err);
  };

  _handleProtocolEnqueue(sequence) {
    this.emit('enqueue', sequence);
  };

  _implyConnect() {
    if (!this._connectCalled) {
      this.connect();
    }
  };
};

function unwrapFromDomain(fn) {
  return function () {
    var domains = [];
    var ret;

    while (process.domain) {
      domains.shift(process.domain);
      process.domain.exit();
    }

    try {
      ret = fn.apply(this, arguments);
    } finally {
      for (var i = 0; i < domains.length; i++) {
        domains[i].enter();
      }
    }

    return ret;
  };
}

function wrapCallbackInDomain(ee, fn) {
  if (typeof fn !== 'function') {
    return undefined;
  }

  if (fn.domain) {
    return fn;
  }

  var domain = process.domain;

  if (domain) {
    return domain.bind(fn);
  } else if (ee) {
    return unwrapFromDomain(wrapToDomain(ee, fn));
  } else {
    return fn;
  }
}

function wrapToDomain(ee, fn) {
  return function () {
    // if (Events.usingDomains && ee.domain) {
    //   ee.domain.enter();
    //   fn.apply(this, arguments);
    //   ee.domain.exit();
    // } else {
      fn.apply(this, arguments);
    // }
  };
}
