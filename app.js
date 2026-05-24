const http = require('http');
const server = http.createServer((req, res) => {
  res.end('Server is running!');
});
server.listen(3000, () => {
  console.log('服务已启动');
});