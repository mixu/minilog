var Transform = require('../../common/transform.js'),
    style = require('./util.js').style;

function FormatNpm() {}

Transform.mixin(FormatNpm);

FormatNpm.prototype.write = function(name, level, args) {
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

  this.emit('item', (name ? name + ' ' : '')
          + (level ? style(pad(level), colors[level]) + ' ' : '')
          + style(
              frame.getFileName().replace(new RegExp('^.*/(.+)$'), '/$1')
              + ":" + frame.getLineNumber()
            , 'grey')
          + ' '
          + args.join(' '));
};

module.exports = FormatNpm;

