var log = require('npmlog')
  , Promise = require('promise')
  , SocketIO = require('socket.io')
  , http = require('http')
  , Client = require('./client')
  , PORT = 9001;

var server = http.createServer();
var io = SocketIO(server);

var SocketServer = module.exports = {
  clients: [],
  port: undefined,
  start: function(){
    return new Promise(function(fulfill, reject){
      SocketServer.port = PORT;

      server.on('error', function(){
        server.listen(++SocketServer.port);
      });

      server.listen(SocketServer.port, function(){ 
        log.info('socket-server', 'listening on port ', SocketServer.port);
        fulfill();
      });

      io.on('connection', function(socket){
        var client = new Client(socket);
        log.info('socket-server', 'new client', client.id)
      });
    });

  },

  addClient: function(client){
    SocketServer.clients.push(client);
  },

  getClients: function(){
    return this.clients.reduce(function(a,b){
      return {
        id: b.id,
        ua: b.ua
      }
    }, {});
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
