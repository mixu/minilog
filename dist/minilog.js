(function(){function require(p, parent){ var path = require.resolve(p) , mod = require.modules[path]; if (!mod) throw new Error('failed to require "' + p + '" from ' + parent); if (!mod.exports) { mod.exports = {}; mod.call(mod.exports, mod, mod.exports, require.relative(path)); } return mod.exports;}require.modules = {};require.resolve = function(path){ var orig = path , reg = path + '.js' , index = path + '/index.js'; return require.modules[reg] && reg || require.modules[index] && index || orig;};require.relative = function(parent) { return function(p){ if ('.' != p.charAt(0)) return require(p); var path = parent.split('/') , segs = p.split('/'); path.pop(); for (var i = 0; i < segs.length; i++) { var seg = segs[i]; if ('..' == seg) path.pop(); else if ('.' != seg) path.push(seg); } return require(path.join('/'), parent); };};
require.modules["jquery"] = { exports: window.$ };
require.modules['index.js'] = function(module, exports, require){var Minilog = require('./minilog.js');

// default formatter for browser
Minilog.format(function(name, level, args) {
  var prefix = [];
  if(name) prefix.push(name);
  if(level) prefix.push(level);
 return prefix.concat(args).join(' ');
});

// support for enabling() console logging easily
var enabled = false, whitelist = [], levelMap = { debug: 1, info: 2, warn: 3, error: 4 };

function filter(name, level) {
  var i, expr;
  for(i = 0; i < whitelist.length; i++) {
    expr = whitelist[i];
    if (expr.topic && expr.topic.test(name) && (expr.level == levelMap.debug || levelMap[level] >= expr.level)) {
      return true;
    }
  }
  return false;
}

Minilog.enable = function(str) {
  if(!enabled) { Minilog.pipe(require('./lib/browser/console.js')).filter(filter); }
  enabled = true;
  whitelist = [];
  if(!str) { str = '*.debug'; }
  var parts = str.split(/[\s,]+/), i, expr;
  for(i = 0; i < parts.length; i++) {
    expr = parts[i].split('.');
    if(expr.length > 2) { expr = [ expr.slice(0, -1).join('.'), expr.slice(-1).join() ]; }
    whitelist.push({ topic: new RegExp('^'+expr[0].replace('*', '.*')), level: levelMap[expr[1]] || 1 });
  }
  if(typeof window != 'undefined' && window.localStorage) {
    window.localStorage.minilogSettings = JSON.stringify(str);
  }
};

// apply enable inputs from localStorage and from the URL
if(typeof window != 'undefined') {
  if(window.localStorage && window.localStorage.minilogSettings) {
    try {
      Minilog.enable(JSON.parse(window.localStorage.minilogSettings));
    } catch(e) { }
  }
  if(window.location && window.location.search) {
    var match = RegExp('[?&]minilog=([^&]*)').exec(window.location.search);
    match && Minilog.enable(decodeURIComponent(match[1]));
  }
}

exports = module.exports = Minilog;
exports.backends = {   browser: require('./lib/browser/console.js'),
  array: require('./lib/browser/array.js'),
  localstorage: require('./lib/browser/localstorage.js') };
};
require.modules['lib/browser/array.js'] = function(module, exports, require){var cache = [ ];

module.exports = {
  write: function(str) {
    cache.push(str);
  },
  end: function() {},
  // utility functions
  get: function() { return cache; },
  empty: function() { cache = []; }
};
};
require.modules['lib/browser/console.js'] = function(module, exports, require){module.exports = {
  write: function(str) {
    if (typeof console === 'undefined' || !console.log) return;
    if (console.log.apply) {
      // console.log.apply is undefined in IE8 and IE9
      // and still useless for objects in IE9. But useful for non-IE browsers.
      return console.log.apply(console, arguments);
    }
    if(!JSON || !JSON.stringify) return;
    // for IE8/9: make console.log at least a bit less awful
    var args = Array.prototype.slice.call(arguments),
        len = args.length;
    for(var i = 0; i < len; i++) {
      args[i] = JSON.stringify(args[i]);
    }
    console.log(args.join(' '));
  },
  end: function() {}
};
};
require.modules['lib/browser/localstorage.js'] = function(module, exports, require){var cache = false;

module.exports = {
  write: function(str) {
    if(typeof window == 'undefined' || !window.localStorage ||
       typeof JSON == 'undefined' || !JSON.stringify || !JSON.parse) return;
    if(!cache) { cache = (window.localStorage.minilog ? JSON.parse(window.localStorage.minilog) : []); }
    cache.push(new Date().toString() + ' '+ str);
    window.localStorage.minilog = JSON.stringify(cache);
  },
  end: function() {}
};
};
require.modules['minilog.js'] = function(module, exports, require){var callbacks = [],
    log = { readable: true },
    def = { format: function() { return ''; } };

log.on = log.addListener = function(ev, callback) {
  callbacks[ev] || (callbacks[ev] = []);
  callbacks[ev].unshift( callback );
  return log;
};

log.emit = function(ev) {
  if(!callbacks[ev]) return;
  var args = Array.prototype.slice.call(arguments, 1);
  for(var i = callbacks[ev].length-1; i >= 0; i--){
    callbacks[ev][i] && callbacks[ev][i].apply(log, args);
  }
};

log.removeListener = log.removeAllListeners = function(ev, callback) {
  if(!callbacks[ev]) return;
  if(!callback) { delete callbacks[ev]; return; }
  for(var i = callbacks[ev].length-1; i >= 0; i--) {
    if(callbacks[ev][i] == callback) {
      callbacks[ev].splice(i, 1);
    }
  }
};

function serialize(args) {
  var items = Array.prototype.slice.call(args);
  if(!JSON || !JSON.stringify) return items;
  for(var i = 0; i < items.length; i++) {
    if(items[i] && typeof items[i] == 'object') {
      // Buffers in Node.js look bad when stringified
      if(items[i].constructor && items[i].constructor.isBuffer) {
        items[i] = items[i].toString();
      } else {
        items[i] = JSON.stringify(items[i]);
      }
    }
  }
  return items;
}

exports = module.exports = function create(name) {
  var o   = function() { log.emit('item', name, undefined, serialize(arguments)); return o; };
  o.debug = function() { log.emit('item', name, 'debug', serialize(arguments)); return o; };
  o.info  = function() { log.emit('item', name, 'info',  serialize(arguments)); return o; };
  o.warn  = function() { log.emit('item', name, 'warn',  serialize(arguments)); return o; };
  o.error = function() { log.emit('item', name, 'error', serialize(arguments)); return o; };
  return o;
};

exports.format = function(formatter) {
  def.format = formatter;
};

exports.pipe = function(dest) {
  var config = {};
  log.on('item', function(name, level, args) {
    if(config.filter && !config.filter(name, level)) return;
    dest.write((config.format ? config : def).format(name, level, args));
  }).on('end', function() { !dest._isStdio && dest.end(); });
  var chain = {
    filter: function(cb) { config.filter = cb; return chain; },
    format: function(cb) { config.format = cb; return chain; },
    pipe: exports.pipe
  };
  return chain;
};

exports.end = function() {
  log.emit('end');
  callbacks = [];
};
};
Minilog = require('index.js');
})();