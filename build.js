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

var build = new Glue()
  .basepath('./')
  .include('./index.js')
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
