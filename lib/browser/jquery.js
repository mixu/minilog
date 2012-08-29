var enabled = true,
    Cache = require('./cache.js');

function Batch(opts) {
  (!opts) && (opts = {});
  this.url = opts.url || 'http://localhost:8000/';
  this.interval = opts.interval || 30*1000;
  this.timer = null;
  this.timeout();
  this._isFormatted = true;
}

Batch.prototype.timeout = function() {
  var self = this;
  if(!this.timer) {
    this.timer = setTimeout(function() {
      self.timer = null;
      self.send(Cache.prepareSend());
    }, this.interval);
  }
};

Batch.prototype.write = function(item) {
  Cache.append(item);
};

Batch.prototype.send = function(messages) {
  var self = this;
  if(!enabled || messages.length < 2) return this.timeout();

  Batch.jQueryWait(function($) {
    $.ajax({
        url: self.url,
        type: 'POST',
        contentType: 'application/json',
        data: Cache.stringify({ logs: messages }),
        dataType: 'json',
        timeout : 10000
    }).success(function() {
      Cache.sendSuccess();
    }).error(function() {
      Cache.sendError();
    }).always(function() {
      self.timeout();
    });
  });
};

Batch.prototype.end = function() {};

Batch.jQueryWait = function(onDone) {
  if(typeof window !== 'undefined' && (window.jQuery || window.$)) {
    return onDone(window.jQuery || window.$);
  } else if (typeof window !== 'undefined') {
    setTimeout(function() { Batch.jQueryWait(onDone); }, 200);
  }
};

Batch.stop = Batch.prototype.stop = function() {
  enabled = false;
};

module.exports = Batch;
