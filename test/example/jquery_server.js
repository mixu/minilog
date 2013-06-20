var fs = require('fs'),
    url = require('url'),
    http = require('http'),
    Glue = require('gluejs');

var server = http.createServer();

var re = /\#([a-zA-Z][\w\d_]+)(?:(?:\s+|$)|\=(\-?\d+(?:\.\d+)?))/g;

var stream = fs.createWriteStream('./log.txt', { flags: 'a' });

var counters = {},
    changed = false;

http.createServer(function(req, res) {
  var data = '',
      parsed = url.parse(req.url, true);

  console.log(req.method, req.url);
  // this section allows CORS

  if (req.headers.origin) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin',req.headers.origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  if(req.method == 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '1728000');
    res.end();
  }

  switch(req.url) {
    case '/':
      res.setHeader('content-type', 'text/html');
      res.end(fs.readFileSync('./jquery_example.html'));
      break;
    case '/minilog.js':
      new Glue()
        .set('verbose', true)
        .basepath('../../')
        .include('./lib/web')
        .include('./lib/common')
        .include('./node_modules/microee/')
        .main('lib/web/index.js')
        .replace({ 'jquery': 'window.$' })
        .export('Minilog')
        .render(function (err, txt) {
          res.setHeader('content-type', 'application/javascript');
          res.end(txt);
        });
      break;
    case '/log':
      if(req.method == 'POST') {
        req.on('data', function(chunk) { data += chunk; });
        req.on('end', function() {
          data = data.split('\n');

          data.forEach(function(line) {
            // parse the logs to make sure they are OK
            // then write them as individual newlines
            try {
              var value = JSON.parse(line);
              // count the bytes stored
              if(!counters[value[0]]) {
                counters[value[0]] = line.length;
              } else {
                counters[value[0]] += line.length;
              }
              // add the client id from the URL
              value.unshift(parsed.query.client_id ? parsed.query.client_id : '');
              stream.write(JSON.stringify(value) +'\n');
            } catch(e) {
              console.log('Could not parse:', line);
              throw e;
            }
          });
          res.end();
        });
      }
      break;
    default:
      res.end();
  }

}).listen(8888, '0.0.0.0', function() {
  console.log('Listening on port 8888.');
});

setInterval(function() {
  if(changed) {
    console.log(counters);
    changed = false;
  }
}, 5000);
