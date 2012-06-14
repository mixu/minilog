var fs = require('fs'),
    http = require('http'),

    Glue = require('gluejs');

var server = http.createServer();

var re = /\#([a-zA-Z][\w\d_]+)(?:(?:\s+|$)|\=(\-?\d+(?:\.\d+)?))/g;

function count(str) {
  var result = { msg: str, ts: Math.round((new Date()).getTime() / 1000) };
  str.replace(re, function(s, key, value) {
    result.metrics || (result.metrics = {});
    result.metrics[key] = (value ? value : 1);
  });
  return result;
}

server.on('request', function(req, res) {
  if(req.url == '/') {
    res.setHeader('content-type', 'text/html');
    res.end(fs.readFileSync('./jquery_example.html'));
  } else if(req.url == '/minilog.js') {
    new Glue()
      .basepath('../../')
      .include('../../index.js')
      .include('../../minilog.js')
      .include('../../backends/jquery.js')
      .replace({ 'jquery': 'window.$' })
      .export('Minilog')
      .render(function (err, txt) {
        res.setHeader('content-type', 'application/javascript');
        res.end(txt);
      });
  } else if(req.url == '/log') {
    // parse the data
    var data = '';
    req.on('data', function(buf) {
      data += buf;
    }).on('end', function() {
      JSON.parse(data).forEach(function(line) {
        process.stdout.write(JSON.stringify(count(line.trim())) + '\n');
      });
      res.end();
    });
  } else {
    console.log('Unknown', req.url);
    res.end();
  }
}).listen(8080, 'localhost');

console.log('Server listening at http://localhost:8080/');
