var cache = [ ];

module.exports = {
  write: function(str) {
    cache.push(str);
  },
  end: function() {},
  // utility functions
  get: function() { return cache; },
  empty: function() { cache = []; }
};
