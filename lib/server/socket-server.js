var log = require('npmlog')
  , socketIO = require('socket.io')
  , api = require('./api')
  , http = require('http')
  , PORT = 9001;


var server = http.createServer();
listen(PORT);

var io = socketIO(server);
api.init(io);

module.exports = api;

function listen(port){
  server.on('error', function(){
    server.listen(++port);
  });

  server.listen(port, function(){
    log.info('socket-server', 'listening on port', port);
    module.exports.port = port;
  });
}

