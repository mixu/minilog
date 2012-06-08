var callbacks = [];

function log(str) {
  callbacks.data && callbacks.data(str + '\n');
}

log.readable = true;

log.on = function(ev, callback) { callbacks[ev] = callback; };
log.removeListener = function() { };

function serialize(args) {
  var items = Array.prototype.slice.call(args);
  for(var i = 0; i < items.length; i++) {
    if(typeof items[i] == 'object') { items[i] = JSON.stringify(items[i]); }
  }
  return items;
}

function create(name) {
  var o   = function() { create.filter(name, undefined, serialize(arguments), log); };
  o.error = function() { create.filter(name, 'error', serialize(arguments), log); };
  o.warn  = function() { create.filter(name, 'warn',  serialize(arguments), log); };
  o.info  = function() { create.filter(name, 'info',  serialize(arguments), log); };
  o.trace = function() { create.filter(name, 'trace', serialize(arguments), log); };
  return o;
}

create.filter = function(name, level, args, log) {
  var prefix = [];
  if(name) prefix.push(name);
  if(level) prefix.push(level);
  log(prefix.concat(args).join(' '));
};

create.pipe = function(dest, options) {
  return require('stream').prototype.pipe.call(log, dest, options);
};

create.end = function() {
  callbacks.end && callbacks.end();
};

module.exports = create;
