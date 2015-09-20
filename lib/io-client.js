var io = require('socket.io-client');

var Client = module.exports = {
  socket: undefined,
  connectedPromise: undefined,
  connect: function(server){
    if(server){
      return connect(server);
    } else {
      return Config.init()
        .then( connect );
    }
  }
};

var connect = function(server){
  var config = Config.get();
  var ip = server? server.ip : config.ip;
  var port = server? server.port : config['api-port'];
  return new Promise(function(resolve, reject){
    Client.socket = io('http://'+ ip +':' + port);
    Client.socket.on('connect', function(){
      resolve( Client.socket );
    });
    Client.socket.on('connect_error', reject)
  });
}