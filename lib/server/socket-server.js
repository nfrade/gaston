var socketIO = require('socket.io')
  , http = require('http')
  , port = 8081;


var server = http.createServer(function(){
  console.log('server is listening on port', port)
});

server.listen(port);

var io = socketIO(server);

module.exports = io;