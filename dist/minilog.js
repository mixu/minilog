(function(){var global = this;function require(p, parent){ var path = require.resolve(p) , mod = require.modules[path]; if (!mod) throw new Error('failed to require "' + p + '" from ' + parent); if (!mod.exports) { mod.exports = {}; mod.call(mod.exports, mod, mod.exports, require.relative(path), global); } return mod.exports;}require.modules = {};require.resolve = function(path){ var orig = path , reg = path + '.js' , index = path + '/index.js'; return require.modules[reg] && reg || require.modules[index] && index || orig;};require.relative = function(parent) { return function(p){ if ('debug' == p) return debug; if ('.' != p.charAt(0)) return require(p); var path = parent.split('/') , segs = p.split('/'); path.pop(); for (var i = 0; i < segs.length; i++) { var seg = segs[i]; if ('..' == seg) path.pop(); else if ('.' != seg) path.push(seg); } return require(path.join('/'), parent); };};
require.modules["jquery"] = { exports: window.$ };
require.modules['index.js'] = function(module, exports, require, global){
var Minilog = require('./minilog.js');
// default formatter for browser
Minilog.format(function(name, level, args) {
  var prefix = [];
  if(name) prefix.push(name);
  if(level) prefix.push(level);
 return prefix.concat(args).join(' ');
});
exports = module.exports = Minilog;
exports.backends = {
  browser: require('./backends/browser_console.js'),
  array: require('./backends/array.js'),
  localstorage: require('./backends/browser_localstorage.js')
};
// allows you to enable logging via localstorage,
// do "window.localStorage.minilogSettings = JSON.stringify(['browser']);"
if(typeof window != 'undefined' && window.localStorage &&
   typeof JSON != 'undefined' && JSON.parse &&
   window.localStorage.minilogSettings) {
  var enabled = JSON.parse(window.localStorage.minilogSettings);
  for(var i = 0; i < enabled.length; i++) {
    if (exports.backends[enabled[i]]) {
      exports.pipe(exports.backends[enabled[i]]);
    }
  }
}
};require.modules['minilog.js'] = function(module, exports, require, global){
var callbacks = [],
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

};require.modules['backends/array.js'] = function(module, exports, require, global){
var cache = [ ];

module.exports = {
  write: function(str) {
    cache.push(str);
  },
  end: function() {},
  // utility functions
  get: function() { return cache; },
  empty: function() { cache = []; }
};

};require.modules['backends/browser_console.js'] = function(module, exports, require, global){
module.exports = {
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

};require.modules['backends/browser_localstorage.js'] = function(module, exports, require, global){
var cache = false;

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

};Minilog = require('index.js');
})();
