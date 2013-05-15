var newlines = /\n+$/;

module.exports = {
  write: function() {
    var args = Array.prototype.slice.call(arguments),
      i = args.length-1;
    if (typeof console === 'undefined' || !console.log) {
      return;
    }
    if(console.log.apply) {
      return console.log.apply(console, args);
    } else if(JSON && JSON.stringify) {
      // console.log.apply is undefined in IE8 and IE9
      // for IE8/9: make console.log at least a bit less awful
      if(args[i] = && typeof args[i] == 'string') {
        args[i] = args[i].replace(newlines, '');
      }
      for(i = 0; i < args.length; i++) {
        args[i] = JSON.stringify(args[i]);
      }
      console.log(args.join(' '));
    }
  },
  end: function() {}
};
