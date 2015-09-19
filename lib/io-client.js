var io = require('socket.io-client')
  , config = require('../config/gaston.json')

var client = module.exports = {
  socket: undefined,
  connectedPromise: undefined,
  connect: function(server){ 
    server = server || {};
    var ip = server.ip || 'localhost';
    var port = server.port || config['api-port'];

    return new Promise(function(resolve, reject){
      client.socket = io('http://'+ ip +':' + port);
      client.socket.on('connect', function(){
        resolve( client.socket );
      });
      client.socket.on('connect_error', reject)
    });
  }
};