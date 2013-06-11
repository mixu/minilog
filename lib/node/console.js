var Transform = require('../common/transform.js');

function ConsoleBackend() { }

Transform.mixin(ConsoleBackend);

ConsoleBackend.prototype.write = function() {
  console.log.apply(console, arguments);
};

var e = new ConsoleBackend();

var levelMap = require('./formatters/util.js').levelMap;

// filter which allows you to disable logging selectively via process.ENV
// Note: invoke with the name of your ENV or a string
e.filterEnv = function(envStr) {
  var whitelist = [], i, expr;
  (envStr || '*.debug')
    .split(/[\s,]+/)
    .forEach(function(part) {
      expr = part.split('.');
      if(expr.length > 2) { expr = [ expr.slice(0, -1).join('.'), expr.slice(-1).join() ]; }
      whitelist.push({ topic: new RegExp('^'+expr[0].replace('*', '.*')), level: levelMap[expr[1]] || 1 });
    });
  function filter(name, level) {
    return whitelist.some(function(expr) {
      return expr.topic && expr.topic.test(name) && levelMap[level] >= expr.level;
    });
  }
  return filter;
};

e.formatters = [
    'formatClean', 'formatColor', 'formatNpm',
    'formatLearnboost', 'formatMinilog', 'formatWithStack'
];

e.formatClean = new (require('./formatters/clean.js'));
e.formatColor = new (require('./formatters/color.js'));
e.formatNpm = new (require('./formatters/npm.js'));
e.formatLearnboost = new (require('./formatters/learnboost.js'));
e.formatMinilog = new (require('./formatters/minilog.js'));
e.formatWithStack = new (require('./formatters/withstack.js'));

module.exports = e;
