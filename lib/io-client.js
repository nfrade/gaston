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
  var ip = server? server.ip : Config.get().ip;
  var port = server? server.port : Config.get()['api-port'];
  return new Promise(function(resolve, reject){
    Client.socket = io('http://'+ ip +':' + port);
    Client.socket.on('connect', function(){
      resolve( Client.socket );
    });
    Client.socket.on('connect_error', reject)
  });
}