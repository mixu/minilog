var MiniLog = require('../../minilog'),
    ConsoleBackend = require('../../backends/node_console');

console.log('Try running this with:');
console.log('export DEBUG=app && node whitelist_example.js');
console.log('export DEBUG="*,-app,-bar" && node whitelist_example.js');

MiniLog
  .pipe(ConsoleBackend)
  .format(ConsoleBackend.formatWithStack)
  .filter(ConsoleBackend.filterEnv);

MiniLog('app').info('Hello world');
MiniLog('foo').info('Hello world');
MiniLog('bar').info('Hello world');

