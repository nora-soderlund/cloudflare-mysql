module.exports = Timer;
function Timer(object) {
  this._object  = object;
  this._timeout = null;
  this.msecs = 0;
}

Timer.prototype.active = function active() {
  if (this._timeout) {
    if (this._timeout.refresh) {
      this._timeout.refresh();
    } else {
      this.start(this.msecs);
    }
  }
};

Timer.prototype.start = function start(msecs) {
  this.stop();

  this.msecs = msecs;
  
  if(msecs)
    this._timeout = setTimeout(this._onTimeout.bind(this), msecs);
};

Timer.prototype.stop = function stop() {
  if (this._timeout) {
    clearTimeout(this._timeout);
    this._timeout = null;
  }
};

Timer.prototype._onTimeout = function _onTimeout() {
  return this._object._onTimeout();
};
