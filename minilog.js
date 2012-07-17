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
