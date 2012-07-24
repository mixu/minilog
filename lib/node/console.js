var styles = {
  //styles
  'bold'      : ['\033[1m',  '\033[22m'],
  'italic'    : ['\033[3m',  '\033[23m'],
  'underline' : ['\033[4m',  '\033[24m'],
  'inverse'   : ['\033[7m',  '\033[27m'],
  //grayscale
  'white'     : ['\033[37m', '\033[39m'],
  'grey'      : ['\033[90m', '\033[39m'],
  'black'     : ['\033[30m', '\033[39m'],
  //colors
  'blue'      : ['\033[34m', '\033[39m'],
  'cyan'      : ['\033[36m', '\033[39m'],
  'green'     : ['\033[32m', '\033[39m'],
  'magenta'   : ['\033[35m', '\033[39m'],
  'red'       : ['\033[31m', '\033[39m'],
  'yellow'    : ['\033[33m', '\033[39m']
},
levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

function style(str, style) {
  return styles[style][0] + str + styles[style][1];
}

module.exports = {
  // backend
  write: function(str) { console.log(str.trim()); },
  end: function() {},
  // filter which allows you to disable logging selectively via process.ENV
  // Note: invoke with the name of your ENV or a string
  filterEnv: function(envStr) {
    var whitelist = [], i, expr;
    (envStr || '*.debug')
      .split(/[\s,]+/)
      .forEach(function(part) {
        expr = part.split('.');
        if(expr.length > 2) { expr = [ expr.slice(0, -1).join('.'), expr.slice(-1).join() ]; }
        whitelist.push({ topic: new RegExp('^'+expr[0].replace('*', '.*')), level: levelMap[expr[1]] || 1 });
      });
    function filter(name, level) {
      return whitelist.some(function(expr) {
        return expr.topic && expr.topic.test(name) && levelMap[level] >= expr.level;
      });
    }
    return filter;
  },
  // formatting
  formatClean: function(name, level, args) {
    function pad(s) { return (s.toString().length == 1? '0'+s : s); }
    return (name ? name + ' ' : '')
            + (level ? level + ' ' : '')
            + args.join(' ');
  },
  formatColor: function(name, level, args) {
    var colors = { debug: 'magenta', info: 'cyan', warn: 'yellow', error: 'red' };
    function pad(s) { return (s.toString().length == 4? ' '+s : s); }
    return (name ? name + ' ' : '')
            + (level ? style('- ' + pad(level.toUpperCase()) + ' -', colors[level]) + ' ' : '')
            + args.join(' ');
  },
  formatNpm: function(name, level, args) {
    var out = {
          debug: '\033[34;40m' + 'debug' + '\033[39m ',
          info: '\033[32m' + 'info'  + '\033[39m  ',
          warn: '\033[30;41m' + 'WARN' + '\033[0m  ',
          error: '\033[31;40m' + 'ERR!' + '\033[0m  '
        };
    return (name ? '\033[37;40m'+ name +'\033[0m ' : '')
            + (level && out[level]? out[level] : '')
            + args.join(' ');
  },
  formatLearnboost: function(name, level, args) {
    var out = {
          debug: '   \033[90m' + 'debug   ' + ' -\033[39m ',
          info: '   \033[36m' + 'info    ' + ' -\033[39m ',
          warn: '   \033[33m' + 'warn    ' + ' -\033[39m ',
          error: '   \033[31m' + 'error   ' + ' -\033[39m '
        };
    return (name ? name +' ' : '')
            + (level && out[level]? out[level] : '')
            + args.join(' ');
  },
  formatWithStack: function(name, level, args) {
    var colors = { debug: 'magenta', info: 'cyan', warn: 'yellow', error: 'red' };
    function pad(s) { return (s.toString().length == 4? ' '+s : s); }
    function getStack() {
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function (err, stack) {
        return stack;
      };
      var err = new Error;
      Error.captureStackTrace(err, arguments.callee);
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    }

    var frame = getStack()[4];

    return (name ? name + ' ' : '')
            + (level ? style(pad(level), colors[level]) + ' ' : '')
            + style(
                frame.getFileName().replace(new RegExp('^.*/(.+)$'), '$1')
                + ":" + frame.getLineNumber()
              , 'grey')
            + ' '
            + args.join(' ');
  }
};
