function jqBackend(options) {
  this.url = options.url || 'http://localhost:8080/';
  this.cache = [];
  this.timer = null;
  this.interval = options.interval || 30*1000;
  this.enabled = true;
  this.jQuery = window.jQuery;
  this.extras = {};
}

jqBackend.prototype.write = function(str) {
  if(!this.timer) { this.init(); }
  this.cache.push(str);
};

jqBackend.prototype.init = function() {
  if(!this.enabled || !this.jQuery) return;
  var self = this;
  this.timer = setTimeout(function() {
    if(self.cache.length == 0) return self.init();

    self.extras.logs = self.cache;
    self.jQuery.ajax(self.url, {
      type: 'POST',
      cache: false,
      processData: false,
      data: JSON.stringify(self.extras),
      contentType: 'application/json',
      timeout: 10000
    }).success(function(data, status, jqxhr) {
      if(data.interval) {
        self.interval = Math.max(1000, data.interval);
      }
    }).error(function() {
        self.interval = 30000;
    }).always(function() {
      self.init();
    });
    self.cache = [];
  }, this.interval);
};

jqBackend.prototype.end = function() {};

// wait until jQuery is defined. Useful if you don't control the load order.
jqBackend.jQueryWait = function(onDone) {
  if(typeof window !== 'undefined' && (window.jQuery || window.$)) {
    return onDone(window.jQuery || window.$);
  } else if (typeof window !== 'undefined') {
    setTimeout(function() { Batch.jQueryWait(onDone); }, 200);
  }
};

module.exports = jqBackend;
