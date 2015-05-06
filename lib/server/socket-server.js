var socketIO = require('socket.io')
  , api = require('./api')
  , http = require('http')
  , port = 8081;


var server = http.createServer();

server.listen(port);

var io = socketIO(server);
api.init(io);

module.exports = api;