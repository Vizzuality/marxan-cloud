const http = require('http');

const body = '🐠';

const requestListener = function (req, res) {
  res.writeHead(200, {
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'text/html; charset=utf-8'
  });
  res.end(body, 'utf8');
}

const server = http.createServer(requestListener);
server.listen(3000);