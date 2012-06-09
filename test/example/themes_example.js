var log = require('../../minilog')('app'),
    ConsoleBackend = require('../../backends/node_console');

function out() {
  log
    .debug('debug message')
    .info('info message')
    .warn('warning')
    .error('this is an error message');
};

console.log('\n== Theme: clean\n');
var config = require('../../minilog').pipe(ConsoleBackend).format(ConsoleBackend.formatClean);
out();

console.log('\n== Theme: color\n');
config.format(ConsoleBackend.formatColor);
out();

console.log('\n== Theme: npm\n');
config.format(ConsoleBackend.formatNpm);
out();

console.log('\n== Theme: learnboost\n');
config.format(ConsoleBackend.formatLearnboost);
out();

console.log('\n== Theme: withStack\n');
config.format(ConsoleBackend.formatWithStack);
out();

