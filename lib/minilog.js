var callbacks = [];

function log(str) {
  log.emit('data', str + '\n');
}

log.readable = true;

log.on = log.addListener = function(ev, callback) {
  callbacks[ev] || (callbacks[ev] = []);
  callbacks[ev].unshift( callback );
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
  var o   = function() { create.filter(name, undefined, serialize(arguments), log); };
  o.error = function() { create.filter(name, 'error', serialize(arguments), log); };
  o.warn  = function() { create.filter(name, 'warn',  serialize(arguments), log); };
  o.info  = function() { create.filter(name, 'info',  serialize(arguments), log); };
  o.trace = function() { create.filter(name, 'trace', serialize(arguments), log); };
  return o;
};

exports.filter = function(name, level, args, log) {
  var prefix = [];
  if(name) prefix.push(name);
  if(level) prefix.push(level);
  log(prefix.concat(args).join(' '));
};

exports.pipe = function(dest, options) {
  return require('stream').prototype.pipe.call(log, dest, options);
};

exports.end = function() {
  log.emit('end');
  callbacks = [];
};

