var Minilog = require('../common/minilog.js');

var oldEnable = Minilog.enable,
    oldDisable = Minilog.disable,
    isChrome = (typeof navigator != 'undefined' && /chrome/i.test(navigator.userAgent)),
    console = require('./console.js');

// Use a more capable logging backend if on Chrome
Minilog.defaultBackend = (isChrome ? console.minilog : console);

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
Minilog.enable = function() {
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
    ;(function() {
      Minilog
        // allow when the name matches foo or bar, and level >= debug
        // remove the line to pipe all log lines
        .pipe(new Minilog.Filter().allow(/^(foo|bar).*/, 'debug'))
        .pipe(new Minilog.backends.jQuery({
          url: 'http://localhost:8080/log',
          interval: 5000
          }));
    }());
