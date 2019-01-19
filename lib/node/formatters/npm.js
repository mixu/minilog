var Transform = require('../../common/transform.js');

function FormatNpm() {}

Transform.mixin(FormatNpm);

FormatNpm.prototype.write = function(name, level, args) {
  var out = {
        debug: '\x1B[34;40m' + 'debug' + '\x1B[39m ',
        info: '\x1B[32m' + 'info'  + '\x1B[39m  ',
        warn: '\x1B[30;41m' + 'WARN' + '\x1B[0m  ',
        error: '\x1B[31;40m' + 'ERR!' + '\x1B[0m  '
      };
  this.emit('item', (name ? '\x1B[37;40m'+ name +'\x1B[0m ' : '')
          + (level && out[level]? out[level] : '')
          + args.join(' '));
};

module.exports = FormatNpm;
