function jqBackend(options) {
  this.url = options.url || 'http://localhost';
}

jqBackend.prototype.write = function(str) {

};

jqBackend.prototype.end = function() {};

module.exports = jqBackend;
