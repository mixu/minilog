var Transform = require('../common/transform.js');

var newlines = /\n+$/,
   isChrome = false;

if(typeof navigator != 'undefined') {
  isChrome = /chrome/i.test(navigator.userAgent);
}

var logger = new Transform();

logger.write = function(name, level, args) {
  var i = args.length-1;
  if (typeof console === 'undefined' || !console.log) {
    return;
  }
  if(console.log.apply) {
    var hex = {
      black: '#000',
      red: '#c23621',
      green: '#25bc26',
      yellow: '#bbbb00',
      blue:  '#492ee1',
      magenta: '#d338d3',
      cyan: '#33bbc8',
      gray: '#808080',
      purple: '#708'
    };
    function color(fg, isInverse) {
      if(isInverse) {
        return 'color: #fff; background: '+hex[fg]+';';
      } else {
        return 'color: '+hex[fg]+';';
      }
    }

    var colors = { debug: ['cyan'], info: ['purple' ], warn: [ 'yellow', true ], error: [ 'red', true ] };

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

      // fn.apply(console, [ '%c'+name+' %c'+level, color('gray'), color.apply(color, colors[level])].concat(args));
      return;
    }
    return console.log.apply(console, [name, level].concat(args));
  } else if(JSON && JSON.stringify) {
    // console.log.apply is undefined in IE8 and IE9
    // for IE8/9: make console.log at least a bit less awful
    if(args[i] && typeof args[i] == 'string') {
      args[i] = args[i].replace(newlines, '');
    }
    try {
      for(i = 0; i < args.length; i++) {
        args[i] = JSON.stringify(args[i]);
      }
    } catch(e) {}
    console.log(args.join(' '));
  }
};

module.exports = logger;
