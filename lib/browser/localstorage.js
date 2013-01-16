var cache = false,
    storage;

function isLocalStorageAvailable() {
  if (storage != null) { return true; }
  if (typeof window == 'undefined' || typeof JSON == 'undefined' ||
      !JSON.stringify || !JSON.parse) { return false; }
  try {
    window.localStorage.setItem('a', 'a');
    window.localStorage.removeItem('a');
    storage = window.localStorage;
    return true;
  } catch(e) {
    return false;
  }
}

module.exports = {
  write: function(str) {
    if(!isLocalStorageAvailable()) { return; }
    if(!cache) { cache = (window.localStorage.minilog ? JSON.parse(window.localStorage.minilog) : []); }
    cache.push(new Date().toString() + ' '+ str);
    window.localStorage.minilog = JSON.stringify(cache);
  },
  end: function() {}
};
