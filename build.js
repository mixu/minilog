var fs = require('fs'),
    path = require('path'),
    Glue = require('gluejs');

if(process.argv.length < 3) {
  console.log('Usage: node build.js <backend> <backend> ...');
  console.log('where backend is one of the following:');
  console.log('\t browser - Log to the browser console');
  console.log('\t array - Log to a array (e.g. for accessing the history)');
  console.log('\t localstorage - Log to localstorage');
  console.log('\t jquery - Log via jQuery.ajax to the server');
  return;
}

var hasBrowser = process.argv.some(function(o) { return o == 'browser'}),
    hasLocalStorage = process.argv.some(function(o) { return o == 'localstorage'}),
    hasArray = process.argv.some(function(o) { return o == 'array'}),
    hasjQuery = process.argv.some(function(o) { return o == 'jquery'});

function getExports() {
  return fs
          .readFileSync('./lib/browser/index.js')
          .toString()
          .replace('%backends_block%', [
            (hasBrowser ? "  browser: require('./lib/browser/console.js')" : undefined ),
            (hasArray ? "  array: require('./lib/browser/array.js')" : undefined ),
            (hasLocalStorage ? "  localstorage: require('./lib/browser/localstorage.js')" : undefined ),
            (hasjQuery ? "  jquery: require('./lib/browser/jquery.js')" : undefined ),
          ].filter(function(v) { return !!v; }).join(',\n'));
}

var build = new Glue()
  .basepath('./')
  .define('index.js', getExports())
  .include('./minilog.js');

if(hasArray) {
  build.include('./lib/browser/array.js');
}
if(hasBrowser) {
  build.include('./lib/browser/console.js');
}
if(hasLocalStorage) {
  build.include('./lib/browser/localstorage.js');
}
if(hasjQuery) {
  build.include('./lib/browser/jquery.js');
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
