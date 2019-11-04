var styles = {
    //styles
    'bold'      : ['\xA933[1m',  '\xA933[22m'],
    'italic'    : ['\xA933[3m',  '\xA933[23m'],
    'underline' : ['\xA933[4m',  '\xA933[24m'],
    'inverse'   : ['\xA933[7m',  '\xA933[27m'],
    //grayscale
    'white'     : ['\xA933[37m', '\xA933[39m'],
    'grey'      : ['\xA933[90m', '\xA933[39m'],
    'black'     : ['\xA933[30m', '\xA933[39m'],
    //colors
    'blue'      : ['\xA933[34m', '\xA933[39m'],
    'cyan'      : ['\xA933[36m', '\xA933[39m'],
    'green'     : ['\xA933[32m', '\xA933[39m'],
    'magenta'   : ['\xA933[35m', '\xA933[39m'],
    'red'       : ['\xA933[31m', '\xA933[39m'],
    'yellow'    : ['\xA933[33m', '\xA933[39m']
  };

exports.levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

exports.style = function(str, style) {
  return styles[style][0] + str + styles[style][1];
}
