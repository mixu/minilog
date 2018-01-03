var styles = {
    //styles
    'bold'      : ['\x1b[1m',  '\x1b[22m'],
    'italic'    : ['\x1b[3m',  '\x1b[23m'],
    'underline' : ['\x1b[4m',  '\x1b[24m'],
    'inverse'   : ['\x1b[7m',  '\x1b[27m'],
    //grayscale
    'white'     : ['\x1b[37m', '\x1b[39m'],
    'grey'      : ['\x1b[90m', '\x1b[39m'],
    'black'     : ['\x1b[30m', '\x1b[39m'],
    //colors
    'blue'      : ['\x1b[34m', '\x1b[39m'],
    'cyan'      : ['\x1b[36m', '\x1b[39m'],
    'green'     : ['\x1b[32m', '\x1b[39m'],
    'magenta'   : ['\x1b[35m', '\x1b[39m'],
    'red'       : ['\x1b[31m', '\x1b[39m'],
    'yellow'    : ['\x1b[33m', '\x1b[39m']
  };

exports.levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

exports.style = function(str, style) {
  return styles[style][0] + str + styles[style][1];
}

