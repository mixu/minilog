var fs = require('fs'),
    assert = require('assert'),
    localStorage = require('./lib/localstorage'),
    Cache = require('../lib/browser/cache');

exports['given a cache'] = {

  before: function() {
    Cache._backend(localStorage);
  },

  beforeEach: function() {
    Cache._clear();
    localStorage.clear();
  },

  'can append': function() {
    Cache.append('foo');
    assert.deepEqual(Cache._get(), ['foo']);
    assert.deepEqual(JSON.parse(localStorage.getItem(Cache._getKey())), { sending: false, value: ['foo']});
  },

  'prepareSend': {
    beforeEach: function() {
      Cache._clear();
      localStorage.clear();
      Cache.append('foo');
      this.oldKey = Cache._getKey();
      this.messages = Cache.prepareSend();
    },

    'returns current content, sets localstorage to sending, resets value, and updates the cache key': function() {
      // returns current content
      assert.deepEqual(['foo'], this.messages);
      var content = JSON.parse(localStorage.getItem(this.oldKey));
      // sets localstorage to sending
      assert.deepEqual(content.value, ['foo']);
      assert.notEqual(content.sending, false);
      // resets value
      assert.deepEqual(Cache._get(), []);
      // updates the cache key
      assert.notEqual(Cache._getKey(), this.oldKey);
    },

    'sendSuccess empties out the items': function() {
      Cache.sendSuccess();
      var content = JSON.parse(localStorage.getItem(this.oldKey));
      assert.strictEqual(content, null);
    },

    'sendError resets the items in localStorage': function() {
      Cache.sendError();
      var content = JSON.parse(localStorage.getItem(this.oldKey));
      assert.deepEqual(content, { sending: false, value: ['foo']});
    },

    'after a sendError, the next prepareSend picks up the messages': function() {
      Cache.sendError();
      Cache.append('bar');
      this.messages = Cache.prepareSend();
      assert.deepEqual(this.messages, ['foo', 'bar']);
    },

    'calling prepareSend multiple times before sendSuccess sendError does not leak keys': function() {

    },

    'works with localStorage disabled': function() {

    },

  }

};

// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
