var fs = require('fs'),
    assert = require('assert'),
    MiniLog = require('../lib/minilog.js');

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
    MiniLog.pipe(this.stream);
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

  'can use log.error, log.warn, log.info, log.trace': function(done) {
    this.log.error('aaa');
    assert.equal(this.stream.content[0], 'error aaa\n');
    this.log.warn('aaa');
    assert.equal(this.stream.content[1], 'warn aaa\n');
    this.log.info('aaa');
    assert.equal(this.stream.content[2], 'info aaa\n');
    this.log.trace('aaa');
    assert.equal(this.stream.content[3], 'trace aaa\n');
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
    this.log.trace('aaa');
    assert.equal(this.stream.content[4], 'ns trace aaa\n');
    done();
  },

  'can filter by namespace and type': function(done) {
    var ns = MiniLog('ns'),
        ns2 = MiniLog('ns2'),
        oldFilter = MiniLog.filter;

    // TODO: this should be just a function that returns true / false
    // TODO: formatters should also be pluggable (?? or maybe they belong in the backend)
    // What about formatters / filters which we want to apply to just one backend?

    MiniLog.filter = function(name, level, args, log) {
      var prefix = [];
      if(name) prefix.push(name);
      if(level) prefix.push(level);
      if(name == 'ns2' && (level == 'info' || level == 'error')) {
        log(prefix.concat(args).join(' '));
      }
    };
    ns('foo');
    ns2('abc');
    ns2.info('cde');
    ns('bar');
    ns2.error('fgh');
    assert.equal(this.stream.content[0], 'ns2 info cde\n');
    assert.equal(this.stream.content[1], 'ns2 error fgh\n');
    MiniLog.filter = oldFilter;
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
  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
