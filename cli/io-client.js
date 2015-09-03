var Promise = require('bluebird')
  , io = require('socket.io-client')
  , config = require('../config.json')

var client = module.exports = {
  socket: undefined,
  connect: function(port){
    port = port || config['api-port'];

    return new Promise(function(fulfill, reject){
      client.socket = io('http://localhost:' + port);
      client.socket.on('connect', function(){
        fulfill( client.socket );
      });
      client.socket.on('connect_error', function(err){
        reject( err, port );
      })
    });
  }
};