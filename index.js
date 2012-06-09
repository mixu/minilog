exports = module.exports = require('./minilog.js');

exports.backends = {
  redis:  require('./backends/redis.js'),
  nodeConsole:  require('./backends/node_console.js'),
  jquery: require('./backends/jquery.js')
};
