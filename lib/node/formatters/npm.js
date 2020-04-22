var Transform = require('../../common/transform.js');

function FormatNpm() {}

Transform.mixin(FormatNpm);

FormatNpm.prototype.write = function(name, level, args) {
  var out = {
        debug: '\xA933[34;40m' + 'debug' + '\xA933[39m ',
        info: '\xA933[32m' + 'info'  + '\xA933[39m  ',
        warn: '\xA933[30;41m' + 'WARN' + '\xA933[0m  ',
        error: '\xA933[31;40m' + 'ERR!' + '\xA933[0m  '
      };
  this.emit('item', (name ? '\xA933[37;40m'+ name +'\xA933[0m ' : '')
          + (level && out[level]? out[level] : '')
          + args.join(' '));
};

module.exports = FormatNpm;
