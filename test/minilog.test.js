var assert = require('assert'),
    MiniLog = require('../lib/minilog.js');

function WriteStream() {
  this.content = [];
}

WriteStream.prototype.write = function(string, encoding) {
  this.content.push(string);
};


exports['given a minilog'] = {

  beforeEach: function(done) {
    this.stream = new WriteStream();
    MiniLog.stream(this.stream);

    this.log = MiniLog();
    done();
  },

  'can log to stream': function(done) {
    this.log('foo');
    assert.equal(this.stream.content[0], 'foo');
    done();
  },

  'can pass multiple arguments': function(done) {
    this.log('foo', 1, true, 'bar');
    assert.equal(this.stream.content[0], 'foo 1 true bar');
    done();
  },

  'can pass object as argument and get JSON': function(done) {
    this.log('foo', { bar: 'baz' });
    assert.equal(this.stream.content[0], 'foo {"bar":"baz"}');
    this.log([1, 2, { bar: 'baz'}]);
    assert.equal(this.stream.content[1], '[1,2,{"bar":"baz"}]');
    done();
  },

  'can use log.error, log.warn, log.info, log.trace': function(done) {
    this.log.error('aaa');
    assert.equal(this.stream.content[0], 'error aaa');
    this.log.warn('aaa');
    assert.equal(this.stream.content[1], 'warn aaa');
    this.log.info('aaa');
    assert.equal(this.stream.content[2], 'info aaa');
    this.log.trace('aaa');
    assert.equal(this.stream.content[3], 'trace aaa');
    done();
  },

  'can create a namespaced logger': function(done) {
    this.log = MiniLog('ns');
    this.log('foo');
    assert.equal(this.stream.content[0], 'ns foo');
    this.log.error('aaa');
    assert.equal(this.stream.content[1], 'ns error aaa');
    this.log.warn('aaa');
    assert.equal(this.stream.content[2], 'ns warn aaa');
    this.log.info('aaa');
    assert.equal(this.stream.content[3], 'ns info aaa');
    this.log.trace('aaa');
    assert.equal(this.stream.content[4], 'ns trace aaa');
    done();
  }
};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
