var Transform = require('../../common/transform.js');

function FormatClean() { }

Transform.mixin(FormatClean);

FormatClean.prototype.write = function (name, level, args) {
  function pad(s) { return (s.toString().length == 1 ? '0' + s : s); }
  this.emit('item', (name ? name + ' ' : '') + (level ? level + ' ' : '') +
    args.map(function (item) {
      return (typeof item == 'string' ? item : util.inspect(item, null, 3, true));
    }).join(' '));
};

module.exports = FormatClean;
