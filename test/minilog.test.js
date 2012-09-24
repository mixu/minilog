var fs = require('fs'),
    assert = require('assert'),
    MiniLog = require('../lib/index.js');

function WriteStream() {
  var self = this;
  this.writable = true;
  this.content = [];
}

require('util').inherits(WriteStream, require('events').EventEmitter);

WriteStream.prototype.write = function(string, encoding) {
  this.content.push(string);
};

WriteStream.prototype.end = function() {};

exports['given a minilog'] = {

  beforeEach: function(done) {
    this.stream = new WriteStream();
    this.pipe = MiniLog.pipe(this.stream);
    this.log = MiniLog();
    done();
  },

  afterEach: function(done) {
    MiniLog.end();
    done();
  },

  'can log to process.stdout': function(done) {
    MiniLog.pipe(process.stdout);
    this.log('foo');
    done();
  },

  'can log to stream': function(done) {
    this.log('foo');
    assert.equal(this.stream.content[0], 'foo\n');
    done();
  },

  'can pass multiple arguments': function(done) {
    this.log('foo', 1, true, 'bar');
    assert.equal(this.stream.content[0], 'foo 1 true bar\n');
    done();
  },

  'can pass object as argument and get JSON': function(done) {
    this.log('foo', { bar: 'baz' });
    assert.equal(this.stream.content[0], 'foo {"bar":"baz"}\n');
    this.log([1, 2, { bar: 'baz'}]);
    assert.equal(this.stream.content[1], '[1,2,{"bar":"baz"}]\n');
    done();
  },

  'can use log.error, log.warn, log.info, log.debug': function(done) {
    this.log.error('aaa');
    assert.equal(this.stream.content[0], 'error aaa\n');
    this.log.warn('aaa');
    assert.equal(this.stream.content[1], 'warn aaa\n');
    this.log.info('aaa');
    assert.equal(this.stream.content[2], 'info aaa\n');
    this.log.debug('aaa');
    assert.equal(this.stream.content[3], 'debug aaa\n');
    done();
  },

  'can create a namespaced logger': function(done) {
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
    done();
  },

  'can filter by namespace and type': function(done) {
    var ns = MiniLog('ns'),
        ns2 = MiniLog('ns2');

    this.pipe.filter(function(name, level) {
      return name == 'ns2' && (level == 'info' || level == 'error');
    });

    ns('foo');
    ns2('abc');
    ns2.info('cde');
    ns('bar');
    ns2.error('fgh');
    assert.equal(this.stream.content[0], 'ns2 info cde\n');
    assert.equal(this.stream.content[1], 'ns2 error fgh\n');
    done();
  },

  'can pipe into file': function(done) {
    var ws = fs.createWriteStream('./temp.log');
    MiniLog.pipe(ws);
    this.log('hello world');
    this.log('foobar');
    MiniLog.end();
    setTimeout(function() {
      assert.equal(fs.readFileSync('./temp.log').toString(), 'hello world\nfoobar\n');
      done();
    }, 10);
  },

  'can format logs': function(done) {
    this.pipe.format(function(name, level, args) {
      return (name ? name.toUpperCase() + ' - ' : '')
           + (level ? level.toUpperCase() + ' - ' : '')
           + args.join(' ') + '\n';
    });

    this.log.error('aaa');
    this.log.warn('aaa');
    this.log.info('aaa');
    assert.equal(this.stream.content[0], 'ERROR - aaa\n');
    assert.equal(this.stream.content[1], 'WARN - aaa\n');
    assert.equal(this.stream.content[2], 'INFO - aaa\n');
    done();
  },

  'logging a buffer doesn\'t look horrible': function(done) {
    this.log(new Buffer('Hello world'));
    assert.equal(this.stream.content[0], 'Hello world\n');
    done();
  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
