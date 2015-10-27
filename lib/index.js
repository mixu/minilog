module.exports = require('./common/minilog.js');

var consoleLogger = require('./node/console.js');

// if we are running inside Electron then use the web version of console.js
var isElectron = (typeof window !== 'undefined' && window.process && window.process.type === 'renderer');
if (isElectron) {
  consoleLogger = require('./web/console.js').minilog;
}

// intercept the pipe method and transparently wrap the stringifier, if the
// destination is a Node core stream

module.exports.Stringifier = require('./node/stringify.js');

var oldPipe = module.exports.pipe;
module.exports.pipe = function(dest) {
  if(dest instanceof require('stream')) {
    return oldPipe.call(module.exports, new (module.exports.Stringifier)).pipe(dest);
  } else {
    return oldPipe.call(module.exports, dest);
  }
};

module.exports.defaultBackend = consoleLogger;
module.exports.defaultFormatter = consoleLogger.formatMinilog;

module.exports.backends = {
  redis: require('./node/redis.js'),
  nodeConsole: consoleLogger,
  console: consoleLogger
};
