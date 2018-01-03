var Transform = require('../../common/transform.js');

function FormatNpm() {}

Transform.mixin(FormatNpm);

FormatNpm.prototype.write = function(name, level, args) {
  var out = {
        debug: '\x1b[34;40m' + 'debug' + '\x1b[39m ',
        info: '\x1b[32m' + 'info'  + '\x1b[39m  ',
        warn: '\x1b[30;41m' + 'WARN' + '\x1b[0m  ',
        error: '\x1b[31;40m' + 'ERR!' + '\x1b[0m  '
      };
  this.emit('item', (name ? '\x1b[37;40m'+ name +'\x1b[0m ' : '')
          + (level && out[level]? out[level] : '')
          + args.join(' '));
};

module.exports = FormatNpm;
