exports = module.exports = require('./minilog.js');

exports.backends = {
  browser: require('./backends/browser_console.js'),
  localstorage: require('./backends/browser_localstorage.js')
};

// allows you to enable logging from the very start
// by doing "window.localStorage.minilogSettings = JSON.stringify(['browser']);"
// this will start logging immediately
if(typeof window != 'undefined' && window.localStorage &&
   typeof JSON != 'undefined' && JSON.parse &&
   window.localStorage.minilogSettings) {
  var enabled = JSON.parse(window.localStorage.minilogSettings);
  for(var i = 0; i < enabled.length; i++) {
    if (exports.backends[enabled[i]]) {
      exports.pipe(exports.backends[enabled[i]]);
    }
  }
}
