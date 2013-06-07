var Transform = require('../../common/transform.js'),
    style = require('./util.js').style;

function FormatMinilog() {}

Transform.mixin(FormatMinilog);

FormatMinilog.prototype.write = function(name, level, args) {
  var colors = { debug: 'blue', info: 'cyan', warn: 'yellow', error: 'red' };
  this.emit('item', (name ? style(name +' ', 'grey') : '')
            + (level ? style(level, colors[level]) + ' ' : '')
            + args.join(' '));
};

module.exports = FormatMinilog;
