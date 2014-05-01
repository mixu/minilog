### Why?

- Works in the browser and on the server
- Themes for Node console output, and for the Chrome console (with fallbacks)
- log.debug, log.info, log.warn, log.error
- Associate log messages with a namespace and then filter by namespace and log level
- Pipe to one or more backend streams at the same time
- Backends:
  - Node: Console, File (and all other WritableStreams), Redis
  - Browser: Console, LocalStorage, jQuery.ajax

## NEW! Minilog v2

See the docs at [http://mixu.net/minilog/](http://mixu.net/minilog/).

I recently released Minilog v2. Heres' what's changed:

- Better browser console output: due to changes in the internals, all parameters are now passed through internally as-is. This means that in browsers other than old IE, any objects and arrays that are logged as objects rather than stringified.
- Better filtering: submodules can now set a default logging level, and configuring the filter is less painful.
- There is an explicit `.disable()` function in addition to `.enable()`
- In Chrome, we support theming the dev console output.
- The internals are more consistent with idiomatic usage of [Streams2](http://blog.nodejs.org/2012/12/20/streams2/) (with 0.8.x backward compatibility provided by readable-stream): filters and formatters are transform streams rather than functions.
- Interface compatibility with Node and browser consoles, since `Minilog.log()` proxies to `Minilog.debug()`

## Pipes everywhere

minilog is more convention than code. The logger is a [EventEmitter](http://nodejs.org/api/events.html), and backends are [Writable streams](http://nodejs.org/api/stream.html). Filters and formatters are duplex (readable + writable) streams.

minilog works in Node, and in the browser:

    // logs are scoped to a namespace for easy filtering (here, the namespace is "app")
    var log = require('minilog')('app');
    require('minilog').enable();

in the browser (via a single exported global ```window.Minilog```):

    <script src="dist/minilog.js"></script>
    <script>
    var log = Minilog('app');
    Minilog.enable();
    </script>

Usage:

    // assuming you've done the two things above
    log
      .debug('debug message')
      .info('info message')
      .log('info message')
      .warn('warning')
      .error('this is an error message');

Output:

![screenshot3](https://github.com/mixu/minilog/raw/master/test/example/screenshot3.png)


To log to the console:

    require('minilog').enable();
    // or .pipe(process.stdout), if you don't want the default formatting and filtering

To log into a file:

    require('minilog').pipe(fs.createWriteStream('./temp.log'));

You can also log to Redis and over HTTP to a RESTful API, see the backends at the end of this page.

You can pipe to more than one endpoint if you want.

## Installation

For Node:

````shell
$ npm install minilog
````

You can find a ready-made file for the web in [`./dist/minilog.js`](https://raw.github.com/mixu/minilog/master/dist/minilog.js).

### Upgrading from minilog v1

Everything is now a pipe, which means that the `.format()` and `.filter()` functions are deprecated. Check out [the new filter mechanism docs](./filter.html). To apply a formatter, you should pipe the input into the formatter, and then pipe it to the desired backend:

    var Minilog = require('minilog');

    Minilog.pipe(Minilog.backends.console.formatWithStack)
           .pipe(Minilog.backends.console);

## Enabling logging

Minilog output is suppressed by default. To enable logging, append `minilog=1` to the page URL:

    http://www.example.com/index.html?minilog=1

or call `Minilog.enable()` from the dev console or in code. On the browser, this also sets a value in LocalStorage so that logging is enabled on subsequent reloads. Call `Minilog.disable()` (*new in v2*) to stop logging.

## Filtering

Minilog supports filtering via the log scope name and the log level, as well as a number of nifty features. See [the filtering docs](http://mixu.net/minilog/filter.html) for more.

## Formatting & themes

Minilog supports themes and custom formatters, and comes several with built-in themes:

![screenshot](https://github.com/mixu/minilog/raw/master/test/example/screenshot.png)

![screenshot2](https://github.com/mixu/minilog/raw/master/test/example/screenshot2.png)

To enable a specific theme, pipe to the formatter and then to the console:

    var Minilog = require('minilog');

    Minilog
        // formatter
        .pipe(Minilog.backends.console.formatClean)
        // backend
        .pipe(Minilog.backends.console);

Have a look at [./test/examples/themes_example.js](https://github.com/mixu/minilog/blob/master/test/example/themes_example.js).

To write your own formatter, have a look at the source code for the formatters - they inherit from `Minilog.Transform`.

## Using Minilog as a console replacement

If you use an injected `console` object to log browser or Node.js activity, you can use Minilog instead: they have similar interfaces. Monolog provides a `log()` method, which proxies to `debug()`.

So for instance, the following snippet:

```js
function doThings(console) {
    if (problem) {
        console.error('problem');
        return;
    }
    console.log('no problem');
}
```

Works seamlessly with Minilog instead of `console`:

```js
var Minilog = require('minilog');
doThings(Minilog);
```

## Backends

Backends are Writable streams which handle stringification.

### Node: Console, Redis

The console backend is literally this (plus code for pretty printing log lines in various ways):

    {
      write: function(str) { process.stdout.write(str); }
    }

The Redis backend is almost equally simple - it accepts ```client``` (an instance of node-redis) and ```key``` and uses rpush() to add to the list at the specified key.

### Browser: Array, Console, jQuery, localStorage

The Array backend stores the log lines into an array. This is useful if you want to keep a list of all the log lines, e.g. for error reporting. Call ```.get()``` to get the array, and ```.clear()``` to empty it.

The Console backend makes sure that ```console.log``` is available. On IE8 and IE9, it tries to make the console a bit less aweful by using JSON.stringify to convert objects into strings (rather than "[Object object]").

The jQuery backend is useful for logging client-side log lines on the server side:

- it sends new log messages as a POST request to a given URL every 30 seconds
- if localStorage is available, logs are written to localStorage as well. This is helpful because it reduces the risk that you lose log lines just because the client navigates to a different page.
- Unsent logs from localStorage are sent the next time the backend is activated (on your domain, localStorage is isolated).
- No errors, even if localStorage is not available or jQuery is not defined (though no POST requests if no jQuery).

The localStorage backend just writes logs to the given ```key``` in localstorage.

Have a look at the example server setup in `./test/examples/jquery_server.js`.
