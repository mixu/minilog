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
};

function style(str, style) {
  return styles[style][0] + str + styles[style][1];
}

module.exports = {
  // backend
  write: function(str) { console.log(str); },
  end: function() {},
  // formatting
  formatClean: function(name, level, args) {
    return '['+new Date().toUTCString()+'] '
            + (name ? name + ' ' : '')
            + (level ? level + ' ' : '')
            + args.join(' ');
  },
  formatColor: function(name, level, args) {
    var colors = { debug: 'magenta', info: 'cyan', warn: 'yellow', error: 'red' };
    return (name ? name + ' ' : '')
            + (level ? style('- ' + level.toUpperCase() + ' -', colors[level]) + ' ' : '')
            + args.join(' ');
  },
  formatNpm: function(name, level, args) {
    var out = {
          debug: '\033[34;40m' + 'debug' + '\033[39m ',
          info: '\033[32m' + 'info' + '\033[39m ',
          warn: '\033[30;41m' + 'WARN' + '\033[0m ',
          error: '\033[31;40m' + 'ERR!' + '\033[0m '
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
  }
};
