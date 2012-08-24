var db;

function LocalStorage() {
}
db = LocalStorage;

db.prototype.getItem = function (key) {
  if (key in this) {
    return String(this[key]);
  }
  return null;
};

db.prototype.setItem = function (key, val) {
  this[key] = String(val);
};

db.prototype.removeItem = function (key) {
  delete this[key];
};

db.prototype.clear = function () {
  var self = this;
  Object.keys(self).forEach(function (key) {
    self[key] = undefined;
    delete self[key];
  });
};

db.prototype.key = function (i) {
  i = i || 0;
  return Object.keys(this)[i];
};

db.prototype.__defineGetter__('length', function () {
  return Object.keys(this).length;
});

module.exports = new LocalStorage();
