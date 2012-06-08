# minilog

# Features

- Works in the browser and on the server
- Very simple client (no external dependencies; less than 100 lines); looks like a readable stream/eventemitter
- Backends are writable streams; allow for picking whatever transport/format you want
- Logs are optionally scoped/namespaced to a particular module, like TJ's [debug](https://github.com/visionmedia/debug) and can be enabled/disabled selectively
- log.error, log.warn, log.info, log.trace

Backends:

- Console, file, engine.io
- Support for counting and timing via #event_hashtags, like Olark's [hashmonitor](https://github.com/olark/hashmonitor) ([presentation](https://speakerdeck.com/u/mjpizz/p/monitor-like-a-boss)); this is implemented as a backend

# Examples

## Namespaces

You can namespace logs:

    var log = require('minilog')('worker'),
        config = { foo: 'bar' };

    require('minilog').pipe(process.stdout);

    log.info('Booting', config);
    log.error('FooBar');
    log('Hello', 'World');

Output:

    worker info Booting {"foo":"bar"}
    worker error FooBar
    worker Hello World

## Writing to file

    var fs = require('fs'),
        MiniLog = require('minilog'),
        log = MiniLog('worker');

    MiniLog.pipe(fs.createWriteStream('./temp.log'));

    log('Booting');
    log.error('FooBar');

Output:

    worker Booting
    worker error FooBar

## Filtering logs by namespace or level

Filters can be applied to pipes:

    MiniLog
      .pipe(process.stdout)
      .filter(function(name, level) {
        var ns = {'worker': true, 'http': true},
            type = {'warn': true, 'error': true};
        return whitelist[name] && type[level];
      });

## Formatting

Formatting can be applied to pipes:

    MiniLog
      .pipe(process.stdout)
      .format(function(name, level, args) {
        return (name ? name.toUpperCase() + ' - ' : '')
             + (level ? level.toUpperCase() + ' ' : '')
             + args.join(' ') + '\n';
      });

## Counting and timing

TODO not done

    log.error('cookie problems #nocookies_for_session'); // use #event for counting
    log.info('#connected #boot_time=100'); // use #timing=value for timing

## Using it in the browser

TODO - use Glue or onejs.
