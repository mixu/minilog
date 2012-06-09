# minilog - features

- Works in the browser and on the server
- Very simple client (no external dependencies; less than 80 lines); looks like a readable stream/eventemitter
- Backends are writable streams, simple to write new adapters
- Formatters/themes and filters are simple functions applied to a particular pipe; ships with multiple options
- Logs are optionally scoped/namespaced to a particular module, like TJ's [debug](https://github.com/visionmedia/debug) and can be enabled/disabled selectively
- log.debug, log.info, log.warn, log.error

Backends:

- Console, file, engine.io
- Support for counting and timing via #event_hashtags, like Olark's [hashmonitor](https://github.com/olark/hashmonitor) ([presentation](https://speakerdeck.com/u/mjpizz/p/monitor-like-a-boss)); this is implemented as a backend

# Examples

## Pipes everywhere

You always pipe to a writable stream. To log to the console:

    require('minilog').pipe(process.stdout);

To log into a file:

    require('minilog').pipe(fs.createWriteStream('./temp.log'));

To log into Redis:

    var client = require('redis').createClient();
    require('minilog').pipe(new require('minilog').backends.redis({ client: client, key: 'logs'}));

To log over HTTP via jQuery.ajax:

    require('minilog').pipe(new require('minilog').backends.jquery({ url: 'http://localhost/'}));

You can pipe to more than one pipe if you want.

## Basic usage and namespaces

Basic usage:

    var log = require('minilog')();

    require('minilog').pipe(process.stdout);

    log
      .debug('debug message')
      .info('info message')
      .warn('warning')
      .error('this is an error message');

You can namespace logs:

    var log = require('minilog')('worker');

    require('minilog').pipe(process.stdout);

    log.info('Booting', { foo: 'bar' });
    log.error('FooBar');
    log('Hello', 'World');

Output:

    worker info Booting {"foo":"bar"}
    worker error FooBar
    worker Hello World

## Formatting / templating

Each pipe returns a chainable config object. Formatting can be applied to pipes:

    MiniLog
      .pipe(process.stdout)
      .format(function(name, level, args) {
        return (name ? name.toUpperCase() + ' - ' : '')
             + (level ? level.toUpperCase() + ' ' : '')
             + args.join(' ') + '\n';
      });

The console logger comes with format functions inspired by [logme](https://github.com/vesln/logme).
The withStack formatter can print the module name and current line number by examining the stack trace.

![screenshot](https://github.com/mixu/useradmin/raw/master/test/example/screenshot.png)

## Adding filters

Filters can be applied to pipes:

    MiniLog
      .pipe(process.stdout)
      .filter(function(name, level) {
        var ns = {'worker': true, 'http': true},
            type = {'warn': true, 'error': true};
        return whitelist[name] && type[level];
      });

## Global log levels via environment variables

The node_console backend (./backends/node_console.js) comes with a filter that you can enable to toggle global log levels via the DEBUG environment variable.

Setup:

    var MiniLog = require('minilog'),
        ConsoleBackend = MiniLog.backends.nodeConsole;

    MiniLog
      .pipe(ConsoleBackend)
      .format(ConsoleBackend.formatWithStack)
      .filter(ConsoleBackend.filterEnv);

    MiniLog('app').info('Hello world');
    MiniLog('foo').info('Hello world');
    MiniLog('bar').info('Hello world');

Note that filters are applied to each pipe individually, so if you have two pipes, you need to set the filter on both (or you can use different filters).

Examples of whitelisting and blacklisting:

    $ export DEBUG=app && node whitelist_example.js
    app  info whitelist_example.js:13 Hello world
    $ export DEBUG="*,-app,-bar" && node whitelist_example.js
    foo  info whitelist_example.js:14 Hello world

## Counting and timing

TODO not done

    log.error('cookie problems #nocookies_for_session'); // use #event for counting
    log.info('#connected #boot_time=100'); // use #timing=value for timing

## Adding annotations

You can add annotations (like date, user account and so on) during the formatting step

## Using it in the browser

TODO - use Glue or onejs.

Logging window.onerror (assuming log is a reference to a logger):

    window.onerror = function(message, file, line){
      log(file+':'+line+' '+message);
    }

## Logging as JSON over a remote connection

## Disabling logging completely via your build system

If your build system supports this (e.g. onejs --tie minilog="..."), use this replacement to disable logging in production builds:

    function minilog() { return minilog; };

