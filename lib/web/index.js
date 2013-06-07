var Minilog = require('../common/minilog.js');

// do this first!
Minilog.defaultBackend = require('./console.js');

// apply enable inputs from localStorage and from the URL
if(typeof window != 'undefined') {
  try {
    Minilog.enable(JSON.parse(window.localStorage['minilogSettings']));
  } catch(e) {}
  if(window.location && window.location.search) {
    var match = RegExp('[?&]minilog=([^&]*)').exec(window.location.search);
    match && Minilog.enable(decodeURIComponent(match[1]));
  }
}

// Make enable also add to localStorage
var oldEnable = Minilog.enable, oldDisable = Minilog.disable;
Minilog.enable = function(filterStr) {
  oldEnable.call(Minilog, true);
  try { window.localStorage['minilogSettings'] = JSON.stringify(true); } catch(e) {}
};

Minilog.disable = function() {
  oldDisable.call(Minilog);
  try { delete window.localStorage.minilogSettings; } catch(e) {}
};

exports = module.exports = Minilog;

exports.backends = {
  array: require('./array.js'),
  browser: Minilog.defaultBackend,
  localStorage: require('./localstorage.js'),
  jQuery: require('./jquery_simple.js')
};
