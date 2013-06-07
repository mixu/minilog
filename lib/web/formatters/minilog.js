var Transform = require('../../common/transform.js'),
    color = require('./util.js');

var isChrome = false,
    logger = new Transform();

if(typeof navigator != 'undefined') {
  isChrome = /chrome/i.test(navigator.userAgent);
}

logger.write = function(name, level, args) {
  if(isChrome) {
    var fn = console.log;
    if(level != 'debug' && console[level]) {
      fn = console[level];
    }
    var altcolors = { debug: ['gray'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] };

    var subset = [], i = 0;
    if(level != 'info') {
      for(; i < args.length; i++) {
        if(typeof args[i] != 'string') break;
      }
      fn.apply(console, [ '%c'+name +' '+ args.slice(0, i).join(' '), color.apply(color, altcolors[level]) ].concat(args.slice(i)));
    } else {
      fn.apply(console, [ '%c'+name, color.apply(color, altcolors[level]) ].concat(args));
    }
    return;
  }
  console.log(args.join(' '));
};

// NOP, because piping the formatted logs can only cause trouble.
logger.pipe = function() { };

module.exports = logger;
