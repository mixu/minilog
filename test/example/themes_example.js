var log = require('minilog')('app'),
    ConsoleBackend = require('minilog').backends.console;

function out() {
  log
    .debug('debug message')
    .info('info message')
    .warn('warning')
    .error('this is an error message');
};

var minilog = require('minilog');

console.log('\n== Default style\n');

minilog.enable();
out();
minilog.disable();

ConsoleBackend.formatters.forEach(function(name) {
  console.log('\n== Theme: '+name+'\n');

  minilog.pipe(ConsoleBackend[name])
         .pipe(ConsoleBackend);

  out();
  minilog.unpipe();
});
