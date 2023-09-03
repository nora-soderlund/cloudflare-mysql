import Connection from './Connection';

var inherits   = require('util').inherits;
var Events     = require('events');

export default class PoolConnection extends Connection {
  constructor(pool, options) {
    super(options);
    
    this._pool  = pool;

    // Bind connection to pool domain
    if (Events.usingDomains) {
      this.domain = pool.domain;
    }

    // When a fatal error occurs the connection's protocol ends, which will cause
    // the connection to end as well, thus we only need to watch for the end event
    // and we will be notified of disconnects.
    this.on('end', this._removeFromPool);
    this.on('error', function (err) {
      if (err.fatal) {
        this._removeFromPool();
      }
    });
  }

  release() {
    var pool = this._pool;

    if (!pool || pool._closed) {
      return undefined;
    }

    return pool.releaseConnection(this);
  };

  // TODO: Remove this when we are removing PoolConnection#end
  _realEnd = Connection.prototype.end;

  end () {
    console.warn(
      'Calling conn.end() to release a pooled connection is ' +
      'deprecated. In next version calling conn.end() will be ' +
      'restored to default conn.end() behavior. Use ' +
      'conn.release() instead.'
    );
    this.release();
  };

  destroy () {
    Connection.prototype.destroy.apply(this, arguments);
    this._removeFromPool(this);
  };

  _removeFromPool() {
    if (!this._pool || this._pool._closed) {
      return;
    }

    var pool = this._pool;
    this._pool = null;

    pool._purgeConnection(this);
  };
};
