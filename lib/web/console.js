var newlines = /\n+$/;

module.exports = {
  format: function(name, level, args) {
    var i = args.length-1;
    if (typeof console === 'undefined' || !console.log) {
      return;
    }
    if(console.log.apply) {
      return console.log.apply(console, args);
    } else if(JSON && JSON.stringify) {
      // console.log.apply is undefined in IE8 and IE9
      // for IE8/9: make console.log at least a bit less awful
      if(args[i] && typeof args[i] == 'string') {
        args[i] = args[i].replace(newlines, '');
      }
      try {
        for(i = 0; i < args.length; i++) {
          args[i] = JSON.stringify(args[i]);
        }
      } catch(e) {}
      console.log(args.join(' '));
    }
  },
  write: function() {},
  end: function() {}
};
