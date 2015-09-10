var Promise = require('bluebird')
  , io = require('socket.io-client')
  , config = require('../config.json')

var client = module.exports = {
  socket: undefined,
  connected: undefined,
  connect: function(port){ 
    port = port || config['api-port'];

    client.connected = new Promise(function(resolve, reject){
      client.socket = io('http://localhost:' + port);
      client.socket.on('connect', function(){
        resolve( client.socket );
      });
      client.socket.on('connect_error', function(err){
        reject( err, port );
      })
    });
  }
};