# minilog

# Features

- Works in the browser and on the server
- Very simple client; looks like a readable stream/eventemitter
- Backends are writable streams; allow for picking whatever transport/format you want
- Logs are optionally scoped/namespaced to a particular module, like TJ's [debug](https://github.com/visionmedia/debug) and can be enabled/disabled selectively
- log.error, log.warn, log.info, log.trace

Backends:

- Console, file, engine.io
- Support for counting and timing via #event_hashtags, like Olark's [hashmonitor](https://github.com/olark/hashmonitor) ([presentation](https://speakerdeck.com/u/mjpizz/p/monitor-like-a-boss)); this is implemented as a backend

# Examples

    var log = require('minilog')('worker');

    log('Booting', name); // Defaults to "log.info"
    log.error('cookie problems #nocookies_for_session'); // use #event for counting
    log.info('#connected #boot_time=100'); // use #timing=value for timing

    // configuring
    var minilog = require('minilog');

    minilog.on('data', function backend() {

    });

