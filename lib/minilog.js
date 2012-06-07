var stream = process.stdout;

function log() {
  var args = Array.prototype.slice.call(arguments);
  for(var i = 0; i < args.length; i++) {
    if(typeof args[i] == 'object') { args[i] = JSON.stringify(args[i]); }
  }
  stream.write( args.join(' ') );
}

log.stream = function(out) {
  stream = out;
};

module.exports = log;
