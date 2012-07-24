# minilog

Client & server-side logging with Stream API-backends and counting, timing support

### Why?

- Works in the browser and on the server (< 80 lines)
- log.debug, log.info, log.warn, log.error
- Backends - Node: Console, File, Redis
- Backends - browser: Console, LocalStorage, jQuery.ajax (todo: Engine.io)
- Pipe to one or more backend streams at the same time
- Pipes can each have a formatters and filters applied to it
- Logging can be scoped to a module; enable/disable logging selectively by level or module
- Support for counting and timing via #event_hashtags (e.g. [hashmonitor](https://speakerdeck.com/u/mjpizz/p/monitor-like-a-boss))

# Example

    // logs can be scoped ("app" namespace)
    var log = require('minilog')('app');

    // pipe to one or more backends
    require('minilog').pipe(process.stdout);

    log
      .debug('debug message')
      .info('info message')
      .warn('warning')
      .error('this is an error message');

# Installing

    $ npm install minilog

# Pipes everywhere

minilog is more convention than code. The logger is an eventemitter, and backends are pipes to a writable stream. To log to the console:

    require('minilog').pipe(process.stdout);

To log into a file:

    require('minilog').pipe(fs.createWriteStream('./temp.log'));

To log into Redis:

    var client = require('redis').createClient();
    require('minilog').pipe(
      new require('minilog').backends.redis({ client: client, key: 'logs'})
      );

To log over HTTP via jQuery.ajax:

    require('minilog').pipe(
      new require('minilog').backends.jquery({ url: 'http://localhost/'})
      );

You can pipe to more than one pipe if you want.

## Basic usage and namespaces

minilog works in Node, and in the browser. Basic usage with Node:

    var log = require('minilog')('app');

    require('minilog').pipe(process.stdout);

    log
      .debug('debug message')
      .info('info message')
      .warn('warning')
      .error('this is an error message');

Basic usage in the browser (via a single exported global ```window.Minilog```:

    <script src="dist/minilog.js"></script>
    <script>
    var log = Minilog('myModule');

    Minilog.pipe(Minilog.backends.browser);

    log.info('info message');
    </script>

There is a default build included under ```./dist/minilog.js```. It includes a selection of backends. You can also make your own build by running ```node build.js``` which allows you to select which backends to include in the build.

## Configuration overview

- Filters
- Themes
- Formatters

## Filtering

Filters can be applied to each pipe individually:

    MiniLog
      .pipe(process.stdout)
      .filter(function(name, level) {
        var ns = {'worker': true, 'http': true},
            type = {'warn': true, 'error': true};
        return whitelist[name] && type[level];
      });

## Filtering - Browser

The dist/minilog.js file includes additional functionality for enabling/disabling logging in the browser. There are two ways to control logging: via the console, and via the URL.

Via the console:

    Minilog.enable(); // enable all logging
    Minilog.enable('*.warn'); // only log where level > "warn"
    // all levels on chat and model_foo
    Minilog.enable('chat,model_foo');
    // only log where level > "warn" for "chat" module and
    // for logging where level > debug for modules starting with "model"
    Minilog.enable('chat.warn,model*.debug');

If localStorage is available, then these settings will be stored in localStorage so that you don't need to run them after each reload.

Via the URL (applied only when the page is reloaded):

    http://www.example.com/index.html?minilog=
    http://www.example.com/index.html?minilog=*.warn
    http://www.example.com/index.html?minilog=chat,model_foo
    http://www.example.com/index.html?minilog=chat.warn,model*.debug

Note that this functionality is just for the pipe to the browser console. If you have additional loggers (such as sending logs back to the server via AJAX), then you need to use the regular pipe() API to set those up.

## Filtering - Node

The node_console backend (./backends/node_console.js) comes with a filter that works like the in-browser filter, except it requires that you pass it a value - usually an environment variable:

    var MiniLog = require('minilog'),
        ConsoleBackend = MiniLog.backends.nodeConsole;

    MiniLog
      .pipe(ConsoleBackend)
      .format(ConsoleBackend.formatWithStack)
      .filter(ConsoleBackend.filterEnv(process.env.MYENV));

Examples:

    $ export MYENV="foo.*" && node whitelist_example.js
    foo  info whitelist_example.js:14 Hello world

Note that filters are applied to each pipe individually, so if you have two pipes, you need to set the filter on both (or you can use different filters).

## Themes - Node

In Node, you can do fancy formatting. The node_console backend has several built-in inspired by [logme](https://github.com/vesln/logme). To enable, configure the format() function:

    var Minilog = require('minilog'),
        consoleBackend = Minilog.backends.nodeConsole;
    Minilog.pipe(consoleBackend).format(consoleBackend.formatClean);

![screenshot](https://github.com/mixu/minilog/raw/master/test/example/screenshot.png)

Have a look at [./test/examples/themes_example.js](https://github.com/mixu/minilog/blob/master/test/example/themes_example.js) - basically, you pass the formatter to .pipe().format().

The withStack formatter can print the module name and current line number by examining the stack trace.

## Formatting / templating

Each pipe returns a chainable config object. Formatting can be applied to pipes:

    MiniLog
      .pipe(process.stdout)
      .format(function(name, level, args) {
        return (name ? name.toUpperCase() + ' - ' : '')
             + (level ? level.toUpperCase() + ' ' : '')
             + args.join(' ') + '\n';
      });

You can set the default formatter via Minilog.format(fn). You might use this to add extra information - like the date, or associated user etc.


## Counting and timing

TODO not done

    log.error('cookie problems #nocookies_for_session'); // use #event for counting
    log.info('#connected #boot_time=100'); // use #timing=value for timing

## Logging as JSON over a remote connection

## Disabling logging completely via your build system

If your build system supports this (e.g. onejs --tie minilog="..."), use this replacement to disable logging in production builds:

    function minilog() { return minilog; };




Logging window.onerror (assuming log is a reference to a logger):

    window.onerror = function(message, file, line){
      log(file+':'+line+' '+message);
    }
