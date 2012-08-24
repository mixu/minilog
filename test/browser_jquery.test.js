var fs = require('fs'),
    assert = require('assert');

var Batch = require('../lib/browser/jquery');

exports['given a jquery backend'] = {

  before: function() {
    Batch.uuid = function() { return 'unique-id'; };
  },

  beforeEach: function() {
    this.j = new Batch();
  },

  'can write a message': function() {
    this.j.write('foo');
    assert.deepEqual(this.j.cache, { 'unique-id': ['foo']});
  },

  'messages are persisted in localStorage': function() {

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

  'reset clears the messages and localstorage': function(done) {
    done();
  },

  'send triggers after timeout': function() {

  },

  'if the list of messages empty, do not send it': function() {

  },

  'if the send fails, then the messages should be resent': function() {

  },

  'if localstorage contains items, they are sent on the first instantiation': function() {

  },

  'if localstorage is empty, nothing is done': function() {

  },

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
