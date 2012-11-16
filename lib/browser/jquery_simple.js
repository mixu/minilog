function jqBackend(options) {
  this.url = options.url || 'http://localhost:8080/';
  this.cache = [];
  this.timer = null;
  this.interval = options.interval || 30*1000;
}

jqBackend.prototype.write = function(str) {
  if(!this.timer) { this.init(); }
  this.cache.push(str);
};

jqBackend.prototype.init = function() {
  var self = this;
  this.timer = setTimeout(function() {
    if(self.cache.length == 0) return self.init();

    $.ajax(self.url, {
      type: 'POST',
      cache: false,
      processData: false,
      data: JSON.stringify(self.cache),
      contentType: 'application/json',
      timeout: 10000
    }).success(function(data, status, jqxhr) {
      if(data.interval) {
        self.interval = Math.min(1000, data.recommend);
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

module.exports = jqBackend;
