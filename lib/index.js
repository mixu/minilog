module.exports = require('./common/minilog.js');

var consoleLogger = require('./node/console.js');

module.exports.defaultBackend = consoleLogger;
module.exports.defaultFormatter = consoleLogger.formatMinilog;

module.exports.backends = {
  redis: require('./node/redis.js'),
  nodeConsole: consoleLogger,
  console: consoleLogger
};
