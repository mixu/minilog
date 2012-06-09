function jqBackend(options) {
  this.url = options.url || 'http://localhost/';
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
    var data = this.cache;
    this.cache = [];
    window.$.post(self.url, data, function(data, textStatus, jqXHR) {
      self.init();
    }, 'json');
  }, this.interval);
};

jqBackend.prototype.end = function() {};

module.exports = jqBackend;
