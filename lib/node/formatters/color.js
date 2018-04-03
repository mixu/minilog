var Transform = require('../../common/transform.js'),
    style = require('./util.js').style,
    util = require('util');

function FormatColor() {}

Transform.mixin(FormatColor);

FormatColor.prototype.write = function(name, level, args) {
  var colors = { debug: 'magenta', info: 'cyan', warn: 'yellow', error: 'red' };
  function pad(s) { return (s.toString().length == 4? ' '+s : s); }
  this.emit('item', (name ? name + ' ' : '')
          + (level ? style('- ' + pad(level.toUpperCase()) + ' -', colors[level]) + ' ' : '')
          + args.map(function(item) {
            return (typeof item == 'string' ? item : util.inspect(item, null, 3, true));
          }).join(' '));
};

module.exports = FormatColor;
