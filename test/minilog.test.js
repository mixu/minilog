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

    this.log = MiniLog;
    done();
  },

  'can log to stream': function(done) {
    this.log('foo');
    assert.equal('foo', this.stream.content[0]);
    done();
  },

  'can pass multiple arguments': function(done) {
    this.log('foo', 1, true, 'bar');
    assert.equal('foo 1 true bar', this.stream.content[0]);
    done();
  },

  'can pass object as argument and get JSON': function(done) {
    this.log('foo', { bar: 'baz' });
    assert.equal('foo {"bar":"baz"}', this.stream.content[0]);
    this.log([1, 2, { bar: 'baz'}]);
    assert.equal('[1,2,{"bar":"baz"}]', this.stream.content[1]);
    done();
  }


};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
