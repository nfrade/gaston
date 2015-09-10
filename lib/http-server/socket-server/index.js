var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , Promise = require('bluebird')
  , SocketIO = require('socket.io')
  , http = require('http')
  , Client = require('./client')
  , PORT = 9001
  , _ = require('lodash');

var server = http.createServer();
var io = SocketIO(server);

var SocketServer = module.exports = {
  io:io,
  clients: [],
  port: undefined,
  start: function(){
    return new Promise(function(resolve, reject){
      SocketServer.port = PORT;

      server.on('error', function(){
        server.listen(++SocketServer.port);
      });

      server.listen( SocketServer.port, resolve );

      io.on('connection', function(socket){
        //added a little shortcut we have to do this a bit better later
        var client = socket.$client = new Client(socket);
        var smapify = require('smapify');
        socket.emit( 'smaps', smapify.smaps );
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
  },
  
  broadcast: function(message, payload, options){
    io.emit(message, payload);
  }

};

SocketServer.reloadClients = function(){
  io.emit('reload');
};
