var stream = process.stdout;

// util
var isArray = Array.isArray || function(obj) {
  return toString.call(obj) == '[object Array]';
};

// logging
function log(args) {
  stream.write( args.join(' ') );
}

log.error = function() {
  log(args);
};

function args(items) {
  for(var i = 0; i < items.length; i++) {
    if(typeof items[i] == 'object') { items[i] = JSON.stringify(items[i]); }
  }
  return items;
}

// instantiation

function create(name) {
  if(name) {
    if(!isArray(name)) { name = [ name ]; }
    return function() {
      log(name.concat(args(Array.prototype.slice.call(arguments))));
    };
  }
  return function() {
      log(args(Array.prototype.slice.call(arguments)));
  };
}

create.stream = function(out) {
  stream = out;
};


module.exports = create;
