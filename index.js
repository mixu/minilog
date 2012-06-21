var Minilog = require('./minilog.js');

// default formatter for Node (adds \n)
Minilog.format(function(name, level, args) {
  var prefix = [];
  if(name) prefix.push(name);
  if(level) prefix.push(level);
  return prefix.concat(args).join(' ') + '\n';
});

exports = module.exports = Minilog;

exports.backends = {
  redis: require('./backends/redis.js'),
  nodeConsole: require('./backends/node_console.js')
};
