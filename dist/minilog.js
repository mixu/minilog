(function(){
var r=function(){var e="function"==typeof require&&require,r=function(i,o,u){o||(o=0);var n=r.resolve(i,o),t=r.m[o][n];if(!t&&e){if(t=e(n))return t}else if(t&&t.c&&(o=t.c,n=t.m,t=r.m[o][t.m],!t))throw new Error('failed to require "'+n+'" from '+o);if(!t)throw new Error('failed to require "'+i+'" from '+u);return t.exports||(t.exports={},t.call(t.exports,t,t.exports,r.relative(n,o))),t.exports};return r.resolve=function(e,n){var i=e,t=e+".js",o=e+"/index.js";return r.m[n][t]&&t?t:r.m[n][o]&&o?o:i},r.relative=function(e,t){return function(n){if("."!=n.charAt(0))return r(n,t,e);var o=e.split("/"),f=n.split("/");o.pop();for(var i=0;i<f.length;i++){var u=f[i];".."==u?o.pop():"."!=u&&o.push(u)}return r(o.join("/"),t,e)}},r}();r.m = [];
r.m[0] = {
"microee": {"c":2,"m":"index.js"},
"lib/web/array.js": function(module, exports, require){
var Transform=require("../common/transform.js"),cache=[];var logger=new Transform;logger.write=function(name,level,args){cache.push([name,level,args])};logger.get=function(){return cache};logger.empty=function(){cache=[]};module.exports=logger;

},
"lib/web/index.js": function(module, exports, require){
var Minilog=require("../common/minilog.js");var oldEnable=Minilog.enable,oldDisable=Minilog.disable,isChrome=typeof navigator!="undefined"&&/chrome/i.test(navigator.userAgent),console=require("./console.js");Minilog.defaultBackend=isChrome?console.minilog:console;if(typeof window!="undefined"){try{Minilog.enable(JSON.parse(window.localStorage["minilogSettings"]))}catch(e){}if(window.location&&window.location.search){var match=RegExp("[?&]minilog=([^&]*)").exec(window.location.search);match&&Minilog.enable(decodeURIComponent(match[1]))}}Minilog.enable=function(){oldEnable.call(Minilog,true);try{window.localStorage["minilogSettings"]=JSON.stringify(true)}catch(e){}return this};Minilog.disable=function(){oldDisable.call(Minilog);try{delete window.localStorage.minilogSettings}catch(e){}return this};exports=module.exports=Minilog;exports.backends={array:require("./array.js"),browser:Minilog.defaultBackend,localStorage:require("./localstorage.js"),jQuery:require("./jquery_simple.js")};

},
"lib/web/console.js": function(module, exports, require){
var Transform=require("../common/transform.js");var newlines=/\n+$/,logger=new Transform;logger.write=function(name,level,args){var i=args.length-1;if(typeof console==="undefined"||!console.log){return}if(console.log.apply){return console.log.apply(console,[name,level].concat(args))}else if(JSON&&JSON.stringify){if(args[i]&&typeof args[i]=="string"){args[i]=args[i].replace(newlines,"")}try{for(i=0;i<args.length;i++){args[i]=JSON.stringify(args[i])}}catch(e){}console.log(args.join(" "))}};logger.formatters=["color","minilog"];logger.color=require("./formatters/color.js");logger.minilog=require("./formatters/minilog.js");module.exports=logger;

},
"lib/common/filter.js": function(module, exports, require){
var Transform=require("./transform.js");var levelMap={debug:1,info:2,warn:3,error:4};function Filter(){this.enabled=true;this.defaultResult=true;this.clear()}Transform.mixin(Filter);Filter.prototype.allow=function(name,level){this._white.push({n:name,l:levelMap[level]});return this};Filter.prototype.deny=function(name,level){this._black.push({n:name,l:levelMap[level]});return this};Filter.prototype.clear=function(){this._white=[];this._black=[];return this};function test(rule,name){return rule.n.test?rule.n.test(name):rule.n==name}Filter.prototype.test=function(name,level){var i,len=Math.max(this._white.length,this._black.length);for(i=0;i<len;i++){if(this._white[i]&&test(this._white[i],name)&&levelMap[level]>=this._white[i].l){return true}if(this._black[i]&&test(this._black[i],name)&&levelMap[level]<=this._black[i].l){return false}}return this.defaultResult};Filter.prototype.write=function(name,level,args){if(!this.enabled||this.test(name,level)){return this.emit("item",name,level,args)}};module.exports=Filter;

},
"lib/common/minilog.js": function(module, exports, require){
var Transform=require("./transform.js"),Filter=require("./filter.js");var log=new Transform,slice=Array.prototype.slice;exports=module.exports=function create(name){var o=function(){log.write(name,undefined,slice.call(arguments));return o};o.debug=function(){log.write(name,"debug",slice.call(arguments));return o};o.info=function(){log.write(name,"info",slice.call(arguments));return o};o.warn=function(){log.write(name,"warn",slice.call(arguments));return o};o.error=function(){log.write(name,"error",slice.call(arguments));return o};o.log=o.debug;o.suggest=exports.suggest;o.format=log.format;return o};exports.defaultBackend=exports.defaultFormatter=null;exports.pipe=function(dest){return log.pipe(dest)};exports.end=exports.unpipe=exports.disable=function(from){return log.unpipe(from)};exports.Transform=Transform;exports.Filter=Filter;exports.suggest=new Filter;exports.enable=function(){if(exports.defaultFormatter){return log.pipe(exports.suggest).pipe(exports.defaultFormatter).pipe(exports.defaultBackend)}return log.pipe(exports.suggest).pipe(exports.defaultBackend)};

},
"lib/common/transform.js": function(module, exports, require){
var microee=require("microee");function Transform(){}microee.mixin(Transform);Transform.prototype.write=function(name,level,args){this.emit("item",name,level,args)};Transform.prototype.end=function(){this.emit("end");this.removeAllListeners()};Transform.prototype.pipe=function(dest){var s=this;s.emit("unpipe",dest);dest.emit("pipe",s);function onItem(){dest.write.apply(dest,Array.prototype.slice.call(arguments))}function onEnd(){!dest._isStdio&&dest.end()}s.on("item",onItem);s.on("end",onEnd);s.when("unpipe",function(from){var match=from===dest||typeof from=="undefined";if(match){s.removeListener("item",onItem);s.removeListener("end",onEnd);dest.emit("unpipe")}return match});return dest};Transform.prototype.unpipe=function(from){this.emit("unpipe",from);return this};Transform.prototype.format=function(dest){throw new Error(["Warning: .format() is deprecated in Minilog v2! Use .pipe() instead. For example:","var Minilog = require('minilog');","Minilog","  .pipe(Minilog.backends.console.formatClean)","  .pipe(Minilog.backends.console);"].join("\n"))};Transform.mixin=function(dest){var o=Transform.prototype,k;for(k in o){o.hasOwnProperty(k)&&(dest.prototype[k]=o[k])}};module.exports=Transform;

},
"lib/web/localstorage.js": function(module, exports, require){
var Transform=require("../common/transform.js"),cache=false;var logger=new Transform;logger.write=function(name,level,args){if(typeof window=="undefined"||typeof JSON=="undefined"||!JSON.stringify||!JSON.parse)return;try{if(!cache){cache=window.localStorage.minilog?JSON.parse(window.localStorage.minilog):[]}cache.push([(new Date).toString(),name,level,args]);window.localStorage.minilog=JSON.stringify(cache)}catch(e){}};module.exports=logger;

},
"lib/web/jquery_simple.js": function(module, exports, require){
var Transform=require("../common/transform.js");var cid=(new Date).valueOf().toString(36);function AjaxLogger(options){this.url=options.url||"";this.cache=[];this.timer=null;this.interval=options.interval||30*1e3;this.enabled=true;this.jQuery=window.jQuery;this.extras={}}Transform.mixin(AjaxLogger);AjaxLogger.prototype.write=function(name,level,args){if(!this.timer){this.init()}this.cache.push([name,level].concat(args))};AjaxLogger.prototype.init=function(){if(!this.enabled||!this.jQuery)return;var self=this;this.timer=setTimeout(function(){var i,logs=[],ajaxData,url=self.url;if(self.cache.length==0)return self.init();for(i=0;i<self.cache.length;i++){try{JSON.stringify(self.cache[i]);logs.push(self.cache[i])}catch(e){}}if(self.jQuery.isEmptyObject(self.extras)){ajaxData=JSON.stringify({logs:logs});url=self.url+"?client_id="+cid}else{ajaxData=JSON.stringify(self.jQuery.extend({logs:logs},self.extras))}self.jQuery.ajax(url,{type:"POST",cache:false,processData:false,data:ajaxData,contentType:"application/json",timeout:1e4}).success(function(data,status,jqxhr){if(data.interval){self.interval=Math.max(1e3,data.interval)}}).error(function(){self.interval=3e4}).always(function(){self.init()});self.cache=[]},this.interval)};AjaxLogger.prototype.end=function(){};AjaxLogger.jQueryWait=function(onDone){if(typeof window!=="undefined"&&(window.jQuery||window.$)){return onDone(window.jQuery||window.$)}else if(typeof window!=="undefined"){setTimeout(function(){AjaxLogger.jQueryWait(onDone)},200)}};module.exports=AjaxLogger;

},
"lib/web/formatters/util.js": function(module, exports, require){
var hex={black:"#000",red:"#c23621",green:"#25bc26",yellow:"#bbbb00",blue:"#492ee1",magenta:"#d338d3",cyan:"#33bbc8",gray:"#808080",purple:"#708"};function color(fg,isInverse){if(isInverse){return"color: #fff; background: "+hex[fg]+";"}else{return"color: "+hex[fg]+";"}}module.exports=color;

},
"lib/web/formatters/color.js": function(module, exports, require){
var Transform=require("../../common/transform.js"),color=require("./util.js");var colors={debug:["cyan"],info:["purple"],warn:["yellow",true],error:["red",true]},logger=new Transform;logger.write=function(name,level,args){var fn=console.log;if(console[level]&&console[level].apply){fn=console[level];fn.apply(console,["%c"+name+" %c"+level,color("gray"),color.apply(color,colors[level])].concat(args))}};logger.pipe=function(){};module.exports=logger;

},
"lib/web/formatters/minilog.js": function(module, exports, require){
var Transform=require("../../common/transform.js"),color=require("./util.js"),colors={debug:["gray"],info:["purple"],warn:["yellow",true],error:["red",true]},logger=new Transform;logger.write=function(name,level,args){var fn=console.log;if(level!="debug"&&console[level]){fn=console[level]}var subset=[],i=0;if(level!="info"){for(;i<args.length;i++){if(typeof args[i]!="string")break}fn.apply(console,["%c"+name+" "+args.slice(0,i).join(" "),color.apply(color,colors[level])].concat(args.slice(i)))}else{fn.apply(console,["%c"+name,color.apply(color,colors[level])].concat(args))}};logger.pipe=function(){};module.exports=logger;

}
};
r.m[1] = {
};
r.m[2] = {
"index.js": function(module, exports, require){
function M(){this._events={}}M.prototype={on:function(ev,cb){this._events||(this._events={});var e=this._events;(e[ev]||(e[ev]=[])).push(cb);return this},removeListener:function(ev,cb){var e=this._events[ev]||[],i;for(i=e.length-1;i>=0&&e[i];i--){if(e[i]===cb||e[i].cb===cb){e.splice(i,1)}}},removeAllListeners:function(ev){if(!ev){this._events={}}else{this._events[ev]&&(this._events[ev]=[])}},listeners:function(ev){return this._events?this._events[ev]||[]:[]},emit:function(ev){this._events||(this._events={});var args=Array.prototype.slice.call(arguments,1),i,e=this._events[ev]||[];for(i=e.length-1;i>=0&&e[i];i--){e[i].apply(this,args)}return this},when:function(ev,cb){return this.once(ev,cb,true)},once:function(ev,cb,when){if(!cb)return this;function c(){if(!when)this.removeListener(ev,c);if(cb.apply(this,arguments)&&when)this.removeListener(ev,c)}c.cb=cb;this.on(ev,c);return this}};M.mixin=function(dest){var o=M.prototype,k;for(k in o){o.hasOwnProperty(k)&&(dest.prototype[k]=o[k])}};module.exports=M;

}
};
Minilog = r("lib/web/index.js");}());
