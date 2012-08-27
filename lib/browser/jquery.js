var enabled = true,
    Cache = require('./cache.js');

function stringify(value) {
  // workaround for prototype.js's broken array.toJSON
  var result = '', oldtoJSON = Array.prototype.toJSON;
  Array.prototype.toJSON = null;
  try {
    result = JSON.stringify(value);
  } finally {
    Array.prototype.toJSON = oldtoJSON;
  }
  return result;
}

function Batch(opts) {
  (!opts) && (opts = {});
  this.url = opts.url || 'http://localhost:8000/';
  this.interval = opts.interval || 30*1000;
  this._isFormatted = opts.isFormatted || false;
  this.timer = null;
  Cache.load();
  this.timeout();
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

Batch.prototype.format = function(name, level, args) {
  this.write([name, level, args]);
};

Batch.prototype.send = function(messages) {
  var self = this;
  if(!enabled) return;
  if(messages.length < 1) return this.timeout();

  Batch.jQueryWait(function($) {
    $.ajax({
        url: self.url,
        type: 'POST',
        contentType: 'application/json',
        data: stringify({ logs: messages }),
        dataType: 'json',
        error:
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

Batch.uuid = function() {
  var length = 6, min = Math.pow(36, length-1), max = Math.pow(36, length);
  return Math.floor(Math.random() * (max - min)+min).toString(36);
};

Batch.jQueryWait = function(onDone) {
  if(typeof window !== 'undefined' && (window.$ || window.jQuery)) {
    return onDone(window.$ || window.jQuery);
  } else if (typeof window !== 'undefined') {
    setTimeout(function() { Batch.jQueryWait(onDone); }, 200);
  }
};

Batch.stop = function() {
  enabled = false;
};

module.exports = Batch;
