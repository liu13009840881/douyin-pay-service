const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Server is running\n');
});

// 关键：必须监听 0.0.0.0:8000
server.listen(8000, '0.0.0.0', () => {
  console.log('Server running on 0.0.0.0:8000');
});