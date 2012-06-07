var stream = process.stdout;

function log(args) {
  stream.write( args.join(' ') );
}

function serialize(args) {
  var items = Array.prototype.slice.call(args);
  for(var i = 0; i < items.length; i++) {
    if(typeof items[i] == 'object') { items[i] = JSON.stringify(items[i]); }
  }
  return items;
}

function create(name) {
  var prefix = (name ? [ name ] : []);
  var o   = function() { log(prefix.concat(serialize(arguments))); };
  o.error = function() { log(prefix.concat('error', serialize(arguments))); };
  o.warn  = function() { log(prefix.concat('warn',  serialize(arguments))); };
  o.info  = function() { log(prefix.concat('info',  serialize(arguments))); };
  o.trace = function() { log(prefix.concat('trace', serialize(arguments))); };
  return o;
}

create.stream = function(out) {
  stream = out;
};

module.exports = create;
