var fs = require('fs'),
    assert = require('assert');

var Batch = require('../lib/browser/jquery'),
    localStorage = require('./lib/localstorage'),
    window = { localStorage: localStorage, jquery: {} };

exports['given a jquery backend'] = {

  before: function() {
    Batch.uuid = function() { return 'unique-id'; };
  },

  beforeEach: function() {
    window.localStorage.setItem('blackbox', '{}');
    this.j = new Batch({ window: window, interval: 1000 });
  },

  'can write a message': function() {
    this.j.write('foo');
    assert.deepEqual(this.j.cache, { 'unique-id': ['foo']});
  },

  'messages are persisted in localStorage': function() {
    this.j.format('voice', 'info', ['#login']);
    this.j.format('voice', 'info', ['#logout']);

    assert.equal(window.localStorage.getItem('blackbox'), JSON.stringify({
      'unique-id': [["voice","info",["#login"]],["voice","info",["#logout"]]]
    }));
  },

  'writing to a full list wraps messages around': function() {
    this.j = new Batch({ size: 10 });
    for (var i = 0; i < 15; i++) {
      this.j.write('event-' + i);
    }

    assert.equal(this.j.cache['unique-id'].length, 10);
    assert.deepEqual(this.j.cache['unique-id'], [
      'event-10',
      'event-11',
      'event-12',
      'event-13',
      'event-14',
      'event-5',
      'event-6',
      'event-7',
      'event-8',
      'event-9'
    ]);
  },

/*
  'reset clears the messages, but not localstorage': function(done) {
    this.j.write('event-1');
    this.j.write('event-2');

    assert.equal(window.localStorage.getItem('blackbox'), JSON.stringify({
      'unique-id': ["event-1","event-2"]
    }));

    Batch.uuid = function() { return 'another-unique-id'; };

    this.j.empty();
    this.j.write('event-3');

    assert.equal(window.localStorage.getItem('blackbox'), JSON.stringify({
      'another-unique-id': ["event-3"]
    }));
    Batch.uuid = function() { return 'unique-id'; };
    done();
  },
*/

  'send triggers after timeout': function(done) {
    var calls = 0, j = this.j = new Batch({ window: window, interval: 100 }),
        oldSend = j.send;
    j.send = function() {
      console.log('send', this);
      calls++;
      oldSend.call(this);
    };
    setTimeout(function() {
      assert.equal(calls, 1);
      done();
    }, 150);
  },

  'if the send fails, then the messages should be resent': function() {

  },

  'if localstorage contains items, they are sent on the first instantiation': function(done) {
    window.localStorage.setItem('blackbox', JSON.stringify({
      'this-is-a-uniqe-id': ['event-1'],
      'this-is-another-uniqe-id': ['event-2']
    }));
    var calls = 0, j = this.j = new Batch({ window: window, interval: 100 }),
        oldSend = j.send;
    j.send = function() {
      calls++;
      oldSend.call(this);
    };

    setTimeout(function() {
      assert.equal(calls, 1);
      done();
    }, 150);
  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
