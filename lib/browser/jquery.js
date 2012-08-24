var window = (typeof window !== undefined ? window : {}),
    hasLocalStorage = false,
    enabled = true;

function checkLocalStorage(window){
  try {
    window.localStorage.setItem('a', 'a');
    window.localStorage.removeItem('a');
    return true;
  } catch(e) {
    return false;
  }
}

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
  this.size = opts.size || 1000;
  this.interval = opts.interval || 30*1000;
  this._isFormatted = opts.isFormatted || false;
  // data
  this.timer = null;
  this.cache = {};
  this.reset();
  // to make testing easier
  if(opts.window) { window = opts.window };
  this.hasLocalStorage = hasLocalStorage = checkLocalStorage(window);
  if(hasLocalStorage) {
    this.cache = JSON.parse(window.localStorage.getItem('blackbox')) || {};
  }
  this.timeout();
}

Batch.prototype.timeout = function() {
  var self = this;
  !this.timer && (this.timer = setTimeout(function() { self.timer = null; self.send(); }, this.interval));
};

Batch.prototype.write = function(item) {
  var cache = this.cache, key = this.key;
  (!cache[key]) && (cache[key] = []);
  cache[key][this.index++ % this.size] = item;
  this.hasLocalStorage && window.localStorage.setItem('blackbox', stringify(cache));
};

Batch.prototype.format = function(name, level, args) {
  this.write([name, level, args]);
};

Batch.prototype.reset = function() {
  this.key && this.cache[this.key] && (delete this.cache[this.key]);
  this.key = Batch.uuid();
  this.index = 0;
  this.hasLocalStorage && window.localStorage.setItem('blackbox', stringify(this.cache));
};

Batch.prototype.send = function() {
  var messages = [], key, self = this, cache = this.cache;
  if(!enabled) return;
  for(key in cache) {
    messages.concat(cache[key]);
  }

  if(messages.length < 1) return this.timeout();
  // empty the cache and change the cache key for writes that occur while the post is ongoing
  this.reset();

  Batch.jQueryWait(function(jQuery) {
    jQuery.ajax({
        url: self.url,
        type: 'POST',
        contentType: 'application/json',
        data: stringify({ logs: messages }),
        dataType: 'json'
    }).done(function() {
      self.hasLocalStorage && window.localStorage.setItem('blackbox', stringify(cache));
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
