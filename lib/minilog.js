var callbacks = [],
    log = { readable: true };

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

log.removeListener = function(ev, callback) {
  if(!callbacks[ev]) return;
  for(var i = callbacks[ev].length-1; i >= 0; i--) {
    if(callbacks[ev][i] == callback) {
      callbacks[ev].splice(i, 1);
    }
  }
};

log.removeAllListeners = function(ev) {
  delete callbacks[ev];
};

function serialize(args) {
  var items = Array.prototype.slice.call(args);
  for(var i = 0; i < items.length; i++) {
    if(typeof items[i] == 'object') { items[i] = JSON.stringify(items[i]); }
  }
  return items;
}

exports = module.exports = function create(name) {
  var o   = function() { log.emit('item', name, undefined, serialize(arguments)); };
  o.error = function() { log.emit('item', name, 'error', serialize(arguments)); };
  o.warn  = function() { log.emit('item', name, 'warn',  serialize(arguments)); };
  o.info  = function() { log.emit('item', name, 'info',  serialize(arguments)); };
  o.trace = function() { log.emit('item', name, 'trace', serialize(arguments)); };
  return o;
};

exports.pipe = function(dest) {
  var config = {};
  log.on('item', function(name, level, args) {
    if(config.filter && !config.filter(name, level)) {
      return;
    }
    if(config.format) {
      dest.write(config.format(name, level, args));
    } else {
      var prefix = [];
      if(name) prefix.push(name);
      if(level) prefix.push(level);
      dest.write(prefix.concat(args).join(' ') + '\n');
    }
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
