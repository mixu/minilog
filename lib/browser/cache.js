var localStorage;

// Cache: a localstorage and array based cache
function checkLocalStorage(window){
  try {
    window.localStorage.setItem('a', 'a');
    window.localStorage.removeItem('a');
    return true;
  } catch(e) {
    return false;
  }
}

var bucket = 'bb_',
    key = bucket + Date.now().toString(36),
    cache = [],
    sending = [];

exports.load = function() {
  this.hasLocalStorage = checkLocalStorage(window);
  if(this.hasLocalStorage) {
    var items = JSON.parse(window.localStorage.getItem('blackbox')) || {};
    var messages = [], key;
    for(key in items) {
      messages = messages.concat(items[key]);
    }
    window.localStorage.setItem('blackbox', stringify({}));
    this.send(messages);
  }
};

function update(key, sending, cache) {
  var value;
  try {
    // cache is optional
    if(cache) {
      value = JSON.stringify({ sending: sending, value: cache });
    } else {
      value = JSON.stringify({ sending: sending, value: JSON.parse(localStorage.getItem(key)).value });
    }

    // some Webkit browsers throw QUOTA_EXCEEDED_ERR on setItem() when there is still space
    localStorage.removeItem(key);
    localStorage.setItem(key, value);
  } catch(e) {
    if(e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      exports.prune(value.length);
      try {
        localStorage.removeItem(key);
        localStorage.setItem(key, value);
      } catch(e) {
        return; // give up, item too big (?)
      }
    } else {
      return;
    }
  }
}

// append a single item into the cache
// key = bb_%timestamp%, value = { sending: false, value: value }
exports.append = function(value) {
  cache.push(value);
  update(key, false, cache);
};

// try to remove at least "amount" worth of data
exports.prune = function(amount) {

};

// collect items to send into memory, set sending flag
exports.prepareSend = function() {
  var messages = [];
  messages = messages.concat(cache);
  sending.push(key);
  update(key, Date.now(), cache);
  // start collecting items in a new key
  cache = [];
  key = bucket + Date.now().toString(36);
  return messages;
};

// remove all items that were marked for send by this process from localstorage
exports.sendSuccess = function() {
  for(var i = 0; i < sending.length; i++) {
    localStorage.removeItem(sending[i]);
  }
  sending = [];
};

// restore the sending flag on all items marked for send
exports.sendError = function() {
  for(var i = 0; i < sending.length; i++) {
    update(sending[i], false);
  }
  sending = [];
};

exports._get = function() { return cache; };
exports._getKey = function() { return key; };
exports._backend = function(backend) { localStorage = backend; };
exports._clear = function() {
  cache = [];
  sending = [];
};
