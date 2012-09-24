var newlines = /\n+$/;

module.exports = {
  write: function(str) {
    var args = Array.prototype.slice.call(arguments),
        len = args.length,
        last = args[args.length-1];
    if (typeof console === 'undefined' || !console.log) return;
    if(last && typeof last === 'string') {
      args[args.length -1] = last.replace(newlines, '');
    }
    if (console.log.apply) {
      // console.log.apply is undefined in IE8 and IE9
      // and still useless for objects in IE9. But useful for non-IE browsers.
      return console.log.apply(console, args);
    }
    if(!JSON || !JSON.stringify) return;
    // for IE8/9: make console.log at least a bit less awful
    for(var i = 0; i < len; i++) {
      args[i] = JSON.stringify(args[i]);
    }
    console.log(args.join(' '));
  },
  end: function() {}
};
