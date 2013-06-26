var Transform = require('../../common/transform.js'),
    style = require('./util.js').style,
    util = require('util');

function FormatMinilog() {}

Transform.mixin(FormatMinilog);

FormatMinilog.prototype.write = function(name, level, args) {
  var colors = { debug: 'blue', info: 'cyan', warn: 'yellow', error: 'red' };
  this.emit('item', (name ? style(name +' ', 'grey') : '')
            + (level ? style(level, colors[level]) + ' ' : '')
            + args.map(function(item) {
              return (typeof item == 'string' ? item : util.inspect(item, null, 3, true));
            }).join(' '));
};

module.exports = FormatMinilog;
