module.exports = require('./common/minilog.js');

var consoleLogger = require('./node/console.js');

// intercept the pipe method and transparently wrap the stringifier, if the
// destination is a Node core stream

var oldPipe = module.exports.pipe;
module.exports.pipe = function(dest) {
  if(dest instanceof require('stream')) {
    return oldPipe.call(module.exports, new (require('./common/stringify.js'))).pipe(dest);
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
