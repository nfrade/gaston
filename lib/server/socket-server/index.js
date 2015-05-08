var log = require('npmlog')
  , SocketIO = require('socket.io')
  , http = require('http')
  , Client = require('./client')
  , API = require('./api')
  , PORT = 9001;

var server = http.createServer();
var io = SocketIO(server);

var SocketServer = module.exports = {
  clients: [],
  start: function(){

    (function listen(port){
      server.on('error', function(){
        server.listen(++port);
      });

      server.listen(port, function(){
        log.info('socket-server', 'listening on port', port);
        SocketServer.port = port;
      });
    })(PORT);

    io.on('connection', function(socket){
      var client = new Client(socket);
      SocketServer.clients.push(client);
      log.info('socket-server', 'new client', client.id)
    });
  },

  hasClients: function(){
    return SocketServer.clients.length > 0;
  },

  removeClient: function(clientId){
    SocketServer.clients = SocketServer.clients.filter(function(client){
      return client.id !== clientId;
    });
    
    log.info('socket-server', 'client disconnected', clientId);
  }
};



SocketServer.reloadClients = function(){
  log.info('socketServer', 'reloading the browser in all clients');
  io.emit('reload');
};





// console.log('server', server);




// // var server = http.createServer();
// // listen(PORT);

// // var io = socketIO(server);

// module.exports = server;

// function listen(port){
//   server.on('error', function(){
//     server.listen(++port);
//   });

//   server.listen(port, function(){
//     log.info('socket-server', 'listening on port', port);
//     server.port = port;
//   });
// }


// server.on('connection', function(){
//   server.connected = true;
// })


// io.on('build', function(options){
//   console.log('building');
// })