var log = require('npmlog')
  , Promise = require('bluebird')
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
      });
    });

  },

  addClient: function(client){
    SocketServer.clients.push(client);
  },

  getClients: function(){
    return this.clients.map(function(item){
      return {
        id: item.id,
        browser: item.browser,
        version: item.version,
        prefix: item.prefix,
        platform: item.platform,
        device: item.device
      };
    });
  },

  hasClients: function(){
    return SocketServer.clients.length > 0;
  },

  removeClient: function(client){
    SocketServer.clients = SocketServer.clients.filter(function(item){
      return item.id !== client.id;
    });
    
    log.info('socket-server', 'client disconnected', client.id, client.platform, client.browser);
  },
  
  broadcast: function(message, payload){
    io.emit(message, payload);
  }
};

SocketServer.reloadClients = function(){
  io.emit('reload');
};
