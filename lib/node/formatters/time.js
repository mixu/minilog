var Transform = require('../../common/transform.js'),
    style = require('./util.js').style,
    util = require('util');

function FormatTime() {}

function timestamp() {
  var d = new Date();
  return ('0' + d.getDate()).slice(-2) + '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
    d.getFullYear() + ' ' +
    ('0' + d.getHours()).slice(-2) + ':' +
    ('0' + d.getMinutes()).slice(-2) + ':' +
    ('0' + d.getSeconds()).slice(-2) + '.' +
    ('00' + d.getMilliseconds()).slice(-3);
}

Transform.mixin(FormatTime);

FormatTime.prototype.write = function(name, level, args) {
  var colors = { debug: 'blue', info: 'cyan', warn: 'yellow', error: 'red' };
  this.emit('item', style(timestamp() +' ', 'grey')
            + (name ? style(name +' ', 'grey') : '')
            + (level ? style(level, colors[level]) + ' ' : '')
            + args.map(function(item) {
              return (typeof item == 'string' ? item : util.inspect(item, null, 3, true));
            }).join(' '));
};

module.exports = FormatTime;
