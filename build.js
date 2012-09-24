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
          .readFileSync('./lib/index.js')
          .toString()
          .replace(/exports.backends = \{[\s\S]*\};/m, '')+
          'exports.backends = {' +
          [
            (hasBrowser ? "  browser: require('./browser/console.js')" : undefined ),
            (hasArray ? "  array: require('./browser/array.js')" : undefined ),
            (hasLocalStorage ? "  localstorage: require('./browser/localstorage.js')" : undefined ),
            (hasjQuery ? "  jquery: require('./browser/jquery.js')" : undefined ),
          ].filter(function(v) { return !!v; }).join(',\n')
          + '};';
}

var build = new Glue()
  .basepath('./')
  .main('lib/index.js')
  .define('lib/index.js', getExports())
  .include('./lib/minilog.js');

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
    txt += '/*global Minilog:false */';
    fs.writeFileSync('./dist/minilog.js', txt);
    console.log('Wrote ./dist/minilog.js');
  });
