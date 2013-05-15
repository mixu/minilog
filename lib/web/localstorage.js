var cache = false;

module.exports = {
  write: function(str) {
    if(typeof window == 'undefined' || typeof JSON == 'undefined' || !JSON.stringify || !JSON.parse) return;
    try {
      if(!cache) { cache = (window.localStorage.minilog ? JSON.parse(window.localStorage.minilog) : []); }
      cache.push(new Date().toString() + ' '+ str);
      window.localStorage.minilog = JSON.stringify(cache);
    } catch(e) {}
  },
  end: function() {}
};
