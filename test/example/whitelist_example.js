var MiniLog = require('../../minilog'),
    ConsoleBackend = require('../../lib/node/console');

console.log('Try running this with:');
console.log('export MYENV=app && node whitelist_example.js');
console.log('export MYENV="foo.*,bar.*" && node whitelist_example.js');

MiniLog
  .pipe(ConsoleBackend)
  .format(ConsoleBackend.formatWithStack)
  .filter(ConsoleBackend.filterEnv(process.env.MYENV));

MiniLog('app').info('Hello world');
MiniLog('foo').info('Hello world');
MiniLog('bar').info('Hello world');

