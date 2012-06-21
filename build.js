var fs = require('fs'),
    path = require('path'),
    Glue = require('gluejs');

if(process.argv.length < 3) {
  console.log('Usage: node build.js <backend> <backend> ...');
  console.log('where backend is one of the following:');
  console.log('\t browser - Log to the browser console');
  console.log('\t localstorage - Log to localstorage');
  console.log('\t jquery - Log via jQuery.ajax to the server');
  return;
}

var hasBrowser = process.argv.some(function(o) { return o == 'browser'}),
    hasLocalStorage = process.argv.some(function(o) { return o == 'localstorage'}),
    hasjQuery = process.argv.some(function(o) { return o == 'jquery'});

function getExports() {
  return [
    'var Minilog = require(\'./minilog.js\');',
    '// default formatter for browser',
    'Minilog.format = function format(name, level, args) {',
    '  var prefix = [];',
    '  if(name) prefix.push(name);',
    '  if(level) prefix.push(level);',
    ' return prefix.concat(args).join(' ');',
    '}',
    'exports = module.exports = Minilog;',
    'exports.backends = {',
      [
        (hasBrowser ? "  browser: require('./backends/browser_console.js')" : undefined ),
        (hasLocalStorage ? "  localstorage: require('./backends/browser_localstorage.js')" : undefined ),
        (hasjQuery ? "  jquery: require('./backends/browser_jquery.js')" : undefined ),
      ].filter(function(v) { return !!v; }).join(',\n'),
    '};',
    '// allows you to enable logging via localstorage,',
    '// do "window.localStorage.minilogSettings = JSON.stringify([\'browser\']);"',
    "if(typeof window != 'undefined' && window.localStorage &&",
    "   typeof JSON != 'undefined' && JSON.parse &&",
    "   window.localStorage.minilogSettings) {",
    "  var enabled = JSON.parse(window.localStorage.minilogSettings);",
    "  for(var i = 0; i < enabled.length; i++) {",
    "    if (exports.backends[enabled[i]]) {",
    "      exports.pipe(exports.backends[enabled[i]]);",
    "    }",
    "  }",
    "}"
    ].join('\n');
}

var build = new Glue()
  .basepath('./')
  .define('index.js', getExports())
  .include('./minilog.js');

if(hasBrowser) {
  build.include('./backends/browser_console.js');
}
if(hasLocalStorage) {
  build.include('./backends/browser_localstorage.js');
}
if(hasjQuery) {
  build.include('./backends/browser_jquery.js');
}

build
  .replace({ 'jquery': 'window.$' })
  .export('Minilog')
  .render(function (err, txt) {
    if(err) throw err;
    if(!path.existsSync('./dist')) {
      fs.mkdirSync('./dist/');
    }
    fs.writeFileSync('./dist/minilog.js', txt);
    console.log('Wrote ./dist/minilog.js');
  });
