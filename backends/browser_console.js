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
