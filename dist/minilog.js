(function(){function require(e,t,n){t||(t=0);var r=require.resolve(e,t),i=require.m[t][r];if(!i)throw new Error('failed to require "'+e+'" from '+n);if(i.c){t=i.c,r=i.m,i=require.m[t][i.m];if(!i)throw new Error('failed to require "'+r+'" from '+t)}return i.exports||(i.exports={},i.call(i.exports,i,i.exports,require.relative(r,t))),i.exports}require.resolve=function(e,t){var n=e,r=e+".js",i=e+"/index.js";return require.m[t][r]&&r||require.m[t][i]&&i||n},require.relative=function(e,t){return function(n){if("."!=n.charAt(0))return require(n,t,e);var r=e.split("/"),i=n.split("/");r.pop();for(var s=0;s<i.length;s++){var o=i[s];".."==o?r.pop():"."!=o&&r.push(o)}return require(r.join("/"),t,e)}};
require.m = [];
/* -- root -- */
require.m[0] = { 
"lib/web/array.js": function(module, exports, require){
var cache = [];

module.exports = {
    write: function(e) {
        cache.push(e);
    },
    end: function() {},
    get: function() {
        return cache;
    },
    empty: function() {
        cache = [];
    }
};},
"lib/web/index.js": function(module, exports, require){
function filter(e, t) {
    var n, r;
    for (n = 0; n < whitelist.length; n++) {
        r = whitelist[n];
        if (r.topic && r.topic.test(e) && (r.level == levelMap.debug || levelMap[t] >= r.level)) return !0;
    }
    return !1;
}

var Minilog = require("../common/minilog.js");

Minilog.defaultBackend = require("./console.js"), Minilog.format(function(e, t, n) {
    var r = [];
    return e && r.push(e), t && r.push(t), r.concat(n).join(" ") + "\n";
});

if (typeof window != "undefined") {
    try {
        Minilog.enable(JSON.parse(window.localStorage.minilogSettings));
    } catch (e) {}
    if (window.location && window.location.search) {
        var match = RegExp("[?&]minilog=([^&]*)").exec(window.location.search);
        match && Minilog.enable(decodeURIComponent(match[1]));
    }
}

var whitelist = [], levelMap = {
    debug: 1,
    info: 2,
    warn: 3,
    error: 4
};

Minilog.filter = function(e, t) {
    whitelist = [], str || (str = "*.debug");
    var n = str.split(/[\s,]+/), r, i;
    for (r = 0; r < n.length; r++) i = n[r].split("."), i.length > 2 && (i = [ i.slice(0, -1).join("."), i.slice(-1).join() ]), whitelist.push({
        topic: new RegExp("^" + i[0].replace("*", ".*")),
        level: levelMap[i[1]] || 1
    });
};

var oldEnable = Minilog.enable;

Minilog.enable = function(e) {
    oldEnable.call(Minilog, !0);
    try {
        window.localStorage.minilogSettings = JSON.stringify(!0);
    } catch (t) {}
}, Minilog.disable = function() {
    try {
        delete window.localStorage.minilogSettings;
    } catch (e) {}
}, exports = module.exports = Minilog, exports.backends = {
    array: require("./array.js"),
    browser: Minilog.defaultBackend,
    localStorage: require("./localstorage.js"),
    jQuery: require("./jquery_simple.js")
};},
"lib/web/console.js": function(module, exports, require){
var newlines = /\n+$/, isChrome = !1;

typeof navigator != "undefined" && (isChrome = /chrome/i.test(navigator.userAgent)), module.exports = {
    format: function(e, t, n) {
        var r = n.length - 1;
        if (typeof console == "undefined" || !console.log) return;
        if (console.log.apply) {
            var i = {
                black: "#000",
                red: "#c23621",
                green: "#25bc26",
                yellow: "#bbbb00",
                blue: "#492ee1",
                magenta: "#d338d3",
                cyan: "#33bbc8",
                gray: "#808080",
                purple: "#708"
            };
            function s(e, t) {
                return t ? "color: #fff; background: " + i[e] + ";" : "color: " + i[e] + ";";
            }
            var o = {
                debug: [ "cyan" ],
                info: [ "purple" ],
                warn: [ "yellow", !0 ],
                error: [ "red", !0 ]
            };
            if (isChrome) {
                var u = console.log;
                t != "debug" && console[t] && (u = console[t]);
                var a = {
                    debug: [ "gray" ],
                    info: [ "purple" ],
                    warn: [ "yellow", !0 ],
                    error: [ "red", !0 ]
                }, f = [], r = 0;
                if (t != "info") {
                    for (; r < n.length; r++) if (typeof n[r] != "string") break;
                    u.apply(console, [ "%c" + e + " " + n.slice(0, r).join(" "), s.apply(s, a[t]) ].concat(n.slice(r)));
                } else u.apply(console, [ "%c" + e, s.apply(s, a[t]) ].concat(n));
                return;
            }
            return console.log.apply(console, [ e, t ].concat(n));
        }
        if (JSON && JSON.stringify) {
            n[r] && typeof n[r] == "string" && (n[r] = n[r].replace(newlines, ""));
            try {
                for (r = 0; r < n.length; r++) n[r] = JSON.stringify(n[r]);
            } catch (l) {}
            console.log(n.join(" "));
        }
    },
    write: function() {},
    end: function() {}
};},
"lib/common/minilog.js": function(module, exports, require){
var microeep = require("microee").prototype, callbacks = [], log = {
    readable: !0
}, def = {
    format: function() {
        return "";
    }
}, slice = Array.prototype.slice;

for (var k in microeep) microeep.hasOwnProperty(k) && (log[k] = microeep[k]);

exports = module.exports = function(t) {
    var n = function() {
        return log.emit("item", t, undefined, slice.call(arguments)), n;
    };
    return n.debug = function() {
        return log.emit("item", t, "debug", slice.call(arguments)), n;
    }, n.info = function() {
        return log.emit("item", t, "info", slice.call(arguments)), n;
    }, n.warn = function() {
        return log.emit("item", t, "warn", slice.call(arguments)), n;
    }, n.error = function() {
        return log.emit("item", t, "error", slice.call(arguments)), n;
    }, n;
}, exports.format = function(e) {
    def.format = e;
}, exports.pipe = function(e) {
    function n(n, r, i) {
        var s = def;
        if (t.filter && !t.filter(n, r, i)) return;
        e.format && (s = e), t.format && (s = t), e.write(s.format(n, r, i));
    }
    function r() {
        !e._isStdio && e.end();
    }
    var t = {};
    log.emit("unpipe", e), log.on("item", n), log.on("end", r), log.when("unpipe", function(t) {
        var i = t == e;
        return i && (log.removeListener("item", n), log.removeListener("end", r)), i;
    });
    var i = {
        filter: function(e) {
            return t.filter = e, i;
        },
        format: function(e) {
            return t.format = e, i;
        },
        pipe: exports.pipe
    };
    return i;
}, exports.unpipe = function(e) {
    return log.emit("unpipe", e), exports;
}, exports.defaultBackend = null, exports.enable = function() {
    return exports.pipe(exports.defaultBackend);
}, exports.disable = function() {
    return exports.unpipe(exports.defaultBackend);
}, exports.end = function() {
    log.emit("end"), log.removeAllListeners();
};},
"lib/web/localstorage.js": function(module, exports, require){
var cache = !1;

module.exports = {
    write: function(e) {
        if (typeof window == "undefined" || typeof JSON == "undefined" || !JSON.stringify || !JSON.parse) return;
        try {
            cache || (cache = window.localStorage.minilog ? JSON.parse(window.localStorage.minilog) : []), cache.push((new Date).toString() + " " + e), window.localStorage.minilog = JSON.stringify(cache);
        } catch (t) {}
    },
    end: function() {}
};},
"lib/web/jquery_simple.js": function(module, exports, require){
function jqBackend(e) {
    this.url = e.url || "http://localhost:8080/", this.cache = [], this.timer = null, this.interval = e.interval || 3e4, this.enabled = !0, this.jQuery = window.jQuery, this.extras = {};
}

jqBackend.prototype.write = function(e) {
    this.timer || this.init(), this.cache.push(e);
}, jqBackend.prototype.init = function() {
    if (!this.enabled || !this.jQuery) return;
    var e = this;
    this.timer = setTimeout(function() {
        if (e.cache.length == 0) return e.init();
        e.extras.logs = e.cache, e.jQuery.ajax(e.url, {
            type: "POST",
            cache: !1,
            processData: !1,
            data: JSON.stringify(e.extras),
            contentType: "application/json",
            timeout: 1e4
        }).success(function(t, n, r) {
            t.interval && (e.interval = Math.max(1e3, t.interval));
        }).error(function() {
            e.interval = 3e4;
        }).always(function() {
            e.init();
        }), e.cache = [];
    }, this.interval);
}, jqBackend.prototype.end = function() {}, jqBackend.jQueryWait = function(e) {
    if (typeof window != "undefined" && (window.jQuery || window.$)) return e(window.jQuery || window.$);
    typeof window != "undefined" && setTimeout(function() {
        jqBackend.jQueryWait(e);
    }, 200);
}, module.exports = jqBackend;},
"microee": {"c":1,"m":"index.js"}};
/* -- microee -- */
require.m[1] = { 
"index.js": function(module, exports, require){
function M() {
    this._events = {};
}

M.prototype = {
    on: function(e, t) {
        this._events || (this._events = {});
        var n = this._events;
        return (n[e] || (n[e] = [])).push(t), this;
    },
    removeListener: function(e, t) {
        var n = this._events[e] || [], r;
        for (r = n.length - 1; r >= 0 && n[r]; r--) (n[r] === t || n[r].cb === t) && n.splice(r, 1);
    },
    removeAllListeners: function(e) {
        e ? this._events[e] && (this._events[e] = []) : this._events = {};
    },
    emit: function(e) {
        this._events || (this._events = {});
        var t = Array.prototype.slice.call(arguments, 1), n, r = this._events[e] || [];
        for (n = r.length - 1; n >= 0 && r[n]; n--) r[n].apply(this, t);
        return this;
    },
    when: function(e, t) {
        return this.once(e, t, !0);
    },
    once: function(e, t, n) {
        function r() {
            n || this.removeListener(e, r), t.apply(this, arguments) && n && this.removeListener(e, r);
        }
        return t ? (r.cb = t, this.on(e, r), this) : this;
    }
}, M.mixin = function(e) {
    var t = M.prototype, n;
    for (n in t) t.hasOwnProperty(n) && (e.prototype[n] = t[n]);
}, module.exports = M;}};
Minilog = require('lib/web/index.js');
}());