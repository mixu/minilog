module.exports = require('./common/minilog.js');

// Serialize in the default formatter instead
module.exports.format(function(name, level, args) {
  var result = [];
  if(name) result.push(name);
  if(level) result.push(level);
  result = result.concat(args);
  for(var i = 0; i < result.length; i++) {
    if(result[i] && typeof result[i] == 'object') {
      // Buffers in Node.js look bad when stringified
      if(result[i].constructor && result[i].constructor.isBuffer) {
        result[i] = result[i].toString();
      } else {
        result[i] = JSON.stringify(result[i]);
      }
    } else {
      result[i] = result[i];
    }
  }
  return result.join(' ') + '\n';
});

module.exports.backends = {
  redis: require('./node/redis.js'),
  nodeConsole: require('./node/console.js'),
  console: require('./node/console.js')
};
