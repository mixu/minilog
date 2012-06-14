var fs = require('fs'),
    path = require('path'),
    Glue = require('gluejs');

new Glue()
  .basepath('./')
  .include('./index.js')
  .include('./minilog.js')
  .include('./backends/browser_console.js')
  .replace({ 'jquery': 'window.$' })
  .export('Minilog')
  .render(function (err, txt) {
    if(err) throw err;
    if(!path.existsSync('./dist')) {
      fs.mkdirSync('./dist/');
    }
    fs.writeFileSync('./dist/minilog.js', txt);
  });
