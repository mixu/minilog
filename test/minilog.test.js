var fs = require('fs'),
    assert = require('assert'),
    MiniLog = require('../lib/index.js'),
    Stringifier = require('../lib/node/stringify.js'),
    Transform = require('../lib/common/transform.js');

function WriteStream() {
  var self = this;
  this.writable = true;
  this.content = [];
}

Transform.mixin(WriteStream);

WriteStream.prototype.write = function(string, encoding) {
  this.content.push(string);
};

WriteStream.prototype.end = function() {};

exports['given a minilog'] = {

  beforeEach: function() {
    this.stream = new WriteStream();
    this.pipe = MiniLog.pipe(new Stringifier()).pipe(this.stream);
    this.log = MiniLog();
  },

  afterEach: function() {
    MiniLog.end();
  },

  'can log to process.stdout': function() {
    MiniLog.pipe(process.stdout);
    this.log('foo');
  },

  'can log to stream': function() {
    this.log('foo');
    assert.equal(this.stream.content[0], 'foo\n');
  },

  'can pass multiple arguments': function() {
    this.log('foo', 1, true, 'bar');
    assert.equal(this.stream.content[0], 'foo 1 true bar\n');
  },

  'can pass object as argument and get JSON': function() {
    this.log('foo', { bar: 'baz' });
    assert.equal(this.stream.content[0], 'foo {"bar":"baz"}\n');
    this.log([1, 2, { bar: 'baz'}]);
    assert.equal(this.stream.content[1], '[1,2,{"bar":"baz"}]\n');
  },

  'can use log.error, log.warn, log.info, log.debug, log.log': function() {
    this.log.error('aaa');
    assert.equal(this.stream.content[0], 'error aaa\n');
    this.log.warn('aaa');
    assert.equal(this.stream.content[1], 'warn aaa\n');
    this.log.info('aaa');
    assert.equal(this.stream.content[2], 'info aaa\n');
    this.log.debug('aaa');
    assert.equal(this.stream.content[3], 'debug aaa\n');
    this.log.log('aaa');
    assert.equal(this.stream.content[4], 'debug aaa\n');
  },

  'can create a namespaced logger': function() {
    this.log = MiniLog('ns');
    this.log('foo');
    assert.equal(this.stream.content[0], 'ns foo\n');
    this.log.error('aaa');
    assert.equal(this.stream.content[1], 'ns error aaa\n');
    this.log.warn('aaa');
    assert.equal(this.stream.content[2], 'ns warn aaa\n');
    this.log.info('aaa');
    assert.equal(this.stream.content[3], 'ns info aaa\n');
    this.log.debug('aaa');
    assert.equal(this.stream.content[4], 'ns debug aaa\n');
  },

  'can filter by namespace and type': function() {
    var ns = MiniLog('ns'),
        ns2 = MiniLog('ns2');

    var filter = new Transform();

    filter.write = function(name, level, args) {
      if(name == 'ns2' && (level == 'info' || level == 'error')) {
        filter.emit('item', name, level, args);
      }
    };

    MiniLog.unpipe();
    this.pipe = MiniLog.pipe(filter).pipe(new Stringifier()).pipe(this.stream);

    ns('foo');
    ns2('abc');
    ns2.info('cde');
    ns('bar');
    ns2.error('fgh');
    assert.equal(this.stream.content[0], 'ns2 info cde\n');
    assert.equal(this.stream.content[1], 'ns2 error fgh\n');
  },

  'can pipe into file': function(done) {
    var ws = fs.createWriteStream(__dirname + '/temp.log');
    MiniLog.pipe(ws);
    this.log('hello world');
    this.log('foobar');
    MiniLog.end();
    setTimeout(function() {
      assert.equal(fs.readFileSync(__dirname + '/temp.log').toString(), 'hello world\nfoobar\n');
      done();
    }, 10);
  },

  'can format logs': function(done) {
    MiniLog.unpipe();

    var format = new Transform();

    format.write = function(name, level, args) {
      this.emit('item', (name ? name.toUpperCase() + ' - ' : '')
           + (level ? level.toUpperCase() + ' - ' : '')
           + args.join(' ') +'\n');
    };

    this.pipe = MiniLog.pipe(format).pipe(this.stream);

    this.log.error('aaa');
    this.log.warn('aaa');
    this.log.info('aaa');
    assert.equal(this.stream.content[0], 'ERROR - aaa\n');
    assert.equal(this.stream.content[1], 'WARN - aaa\n');
    assert.equal(this.stream.content[2], 'INFO - aaa\n');
    done();
  },

  'logging a buffer doesn\'t look horrible': function() {
    this.log(new Buffer('Hello world'));
    assert.equal(this.stream.content[0], 'Hello world\n');
  },

  'logging an object with a circular structure does not blow': function() {
    var circularObject = {
      foo: 'bar'
    };
    circularObject.circleBack = circularObject;

    this.log(circularObject);
    assert.equal(this.stream.content[0], '[object Object]\n');
  },

  'logging an object with a circular structure uses the toString() method of the object': function() {
    var circularObject = {
      foo: 'bar'
    };

    circularObject.circleBack = circularObject;

    circularObject.toString = function () {
      return "circular object";
    };

    this.log(circularObject);
    assert.equal(this.stream.content[0], circularObject.toString() + '\n');
  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
