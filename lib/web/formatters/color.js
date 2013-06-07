var Transform = require('../../common/transform.js'),
    color = require('./util.js');

var isChrome = false,
    logger = new Transform();

if(typeof navigator != 'undefined') {
  isChrome = /chrome/i.test(navigator.userAgent);
}

logger.write = function(name, level, args) {
  var colors = { debug: ['cyan'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] };

  if(isChrome) {
    return console.log.apply(console, [ '%c'+name+' %c'+level, color('gray'), color.apply(color, colors[level])].concat(args));
  }
  console.log(args.join(' '));
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;
