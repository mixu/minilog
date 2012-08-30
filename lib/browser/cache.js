var localStorage;

// Cache: a localstorage and array based cache
function checkLocalStorage(){
  // cache check result
  if(localStorage) return true;
  try {
    window.localStorage.setItem('a', 'a');
    window.localStorage.removeItem('a');
    localStorage = window.localStorage;
    return true;
  } catch(e) {
    return false;
  }
}

exports.stringify = function(value) {
  // workaround for prototype.js's broken array.toJSON
  var result = '', oldtoJSON = Array.prototype.toJSON;
  Array.prototype.toJSON = null;
  try {
    result = JSON.stringify(value);
  } finally {
    Array.prototype.toJSON = oldtoJSON;
  }
  return result;
};

var bucket = 'bb_',
    key = bucket + new Date().valueOf().toString(36),
    cache = [],
    sending = [];

function update(key, value) {
  var val;
  try {
    value = exports.stringify(value);
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
    }
  }
}

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return {};
  }
}

// append a single item into the cache
// key = bb_%timestamp%, value = { sending: false, value: value }
exports.append = function(value) {
  cache.push(value);
  if(!checkLocalStorage()) return;
  update(key, { sending: false, value: cache });
};

// try to remove at least "amount" worth of data
exports.prune = function(amount) {
  if(!checkLocalStorage()) return;
  var i, ikey, keys = [], removed = 0;
  if(!amount) return;
  for(i = 0; i < localStorage.length; i++) {
    ikey = localStorage.key(i);
    if(ikey.substr(0, bucket.length) == bucket) {
      keys.push(parseInt(ikey.substr(bucket.length), 36));
    }
  }
  keys.sort();
  while(keys.length) {
    ikey = bucket+(keys.shift()).toString(36);
    removed += (localStorage.getItem(ikey) || '').length;
    localStorage.removeItem(ikey);
    if(removed > amount) break;
  }
};

// collect items to send into memory, set sending flag
exports.prepareSend = function() {
  if(sending.length !== 0) return [];
  var messages = [], i, ikey, keys = [], item;
  if(!checkLocalStorage()) {
    messages = cache;
  } else {
    // per http://dev.w3.org/html5/webstorage/#storage-0,
    // adding or removing a key may change the order of the keys,
    // hence pre-fetch the keys before examining/modifying them in order
    for(i = 0; i < localStorage.length; i++) {
      ikey = localStorage.key(i);
      if(ikey.substr(0, bucket.length) == bucket) {
        keys.push(ikey);
      }
    }
    for(i = 0; i < keys.length; i++) {
      ikey = keys[i];
      item = get(ikey);
      // check expiry (sending = false, or sending = older than 5 minutes ago)
      if(item.sending === false || item.sending < new Date().valueOf() - 5*60*1000) {
        // append to current log
        messages = messages.concat(item.value);
        sending.push(ikey);
        update(ikey, { sending: new Date().valueOf(), value: item.value });
      }
    }
  }
  // start collecting items in a new key
  cache = [];
  ikey = key;
  while(key == ikey) {
    key = bucket + new Date().valueOf().toString(36);
  }
  return messages;
};

// remove all items that were marked for send by this process from localstorage
exports.sendSuccess = function() {
  if(!checkLocalStorage()) return;
  for(var i = 0; i < sending.length; i++) {
    localStorage.removeItem(sending[i]);
  }
  sending = [];
};

// restore the sending flag on all items marked for send
exports.sendError = function() {
  if(!checkLocalStorage()) return;
  for(var i = 0; i < sending.length; i++) {
    update(sending[i], { sending: false, value: get(sending[i]).value } );
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
