var assert = require('assert');

// support for enabling() console logging easily
var enabled = false, whitelist = [];

var levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

function filter(name, level) {
  var i, expr;
  for(i = 0; i < whitelist.length; i++) {
    expr = whitelist[i];
    if (expr.topic && expr.topic.test(name) && levelMap[level] >= expr.level) {
      return true;
    }
  }
  return false;
}

function enable(str) {
  whitelist = [];
  var parts = (str || '*.debug').split(/[\s,]+/), i, expr;
  for(i = 0; i < parts.length; i++) {
    expr = parts[i].split('.');
    if(expr.length > 2) { expr = [ expr.slice(0, -1).join('.'), expr.slice(-1).join() ]; }
    whitelist.push({ topic: new RegExp('^'+expr[0].replace('*', '.*')), level: levelMap[expr[1]] || 1 });
  }
}

exports['enable all'] = function(done) {
  enable();
  assert.ok(filter('aaa', 'debug'));
  assert.ok(filter('aab', 'info'));
  assert.ok(filter('aaa', 'warn'));
  assert.ok(filter('aab', 'error'));
  done();
};

exports['enabling by wildcard'] = function(done) {
  enable('*.info');
  assert.ok(!filter('aaa', 'debug'));
  assert.ok(filter('aab', 'info'));
  assert.ok(filter('aaa', 'warn'));
  assert.ok(filter('aab', 'error'));
  done();
};

exports['enable two modules'] = function(done) {
  enable('aaa,bb*.warn');
  assert.ok(filter('aaa', 'debug'));
  assert.ok(filter('aaa', 'info'));
  assert.ok(filter('aaa', 'warn'));
  assert.ok(filter('aaa', 'error'));
  assert.ok(!filter('bbb', 'debug'));
  assert.ok(!filter('bbb', 'info'));
  assert.ok(filter('bbb', 'warn'));
  assert.ok(filter('bbb', 'error'));
  assert.ok(!filter('bba', 'debug'));
  assert.ok(!filter('bba', 'info'));
  assert.ok(filter('bba', 'warn'));
  assert.ok(filter('bba', 'error'));
  assert.ok(!filter('ccc', 'debug'));
  assert.ok(!filter('ccc', 'info'));
  assert.ok(!filter('ccc', 'warn'));
  assert.ok(!filter('ccc', 'error'));
  done();
};

exports['enable two modules with levels'] = function(done) {
  enable('aaa.info,bbb.warn');
  assert.ok(!filter('aaa', 'debug'));
  assert.ok(filter('aaa', 'info'));
  assert.ok(filter('aaa', 'warn'));
  assert.ok(filter('aaa', 'error'));
  assert.ok(!filter('bbb', 'debug'));
  assert.ok(!filter('bbb', 'info'));
  assert.ok(filter('bbb', 'warn'));
  assert.ok(filter('bbb', 'error'));
  done();
};

exports['when the module name contains a dot'] = function(done) {
  enable('aaa.bbb.warn');
  assert.ok(!filter('aaa.bbb', 'debug'));
  assert.ok(!filter('aaa.bbb', 'info'));
  assert.ok(filter('aaa.bbb', 'warn'));
  assert.ok(filter('aaa.bbb', 'error'));
  done();
};
// if this module is the script being run, then run the tests:
if (module == require.main) {
  var mocha = require('child_process').spawn('../node_modules/.bin/mocha', [ '--colors', '--ui', 'exports', '--reporter', 'spec', __filename ]);
  mocha.stdout.pipe(process.stdout);
  mocha.stderr.pipe(process.stderr);
}
