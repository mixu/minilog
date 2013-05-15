var log = require('minilog')('app'),
    ConsoleBackend = require('minilog').backends.console;

function out() {
  log
    .debug('debug message')
    .info('info message')
    .warn('warning')
    .error('this is an error message');
};

var config = require('minilog').pipe(ConsoleBackend);

ConsoleBackend.formatters.forEach(function(name) {
  console.log('\n== Theme: '+name+'\n');
  config.format(ConsoleBackend[name]);
  out();
});
