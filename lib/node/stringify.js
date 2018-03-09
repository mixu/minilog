var Transform = require('../common/transform.js'),
  util = require('util');

function Stringify() { }

Transform.mixin(Stringify);

Stringify.prototype.write = function (name, level, args) {
  this.emit('item', (name ? name + ' ' : '') + (level ? level + ' ' : '') +
    args.map(function (item) {
      return (typeof item == 'string' ? item : util.inspect(item, {
        depth: 3,
        colors: false
      }));
    }).join(' '));
};

module.exports = Stringify;
