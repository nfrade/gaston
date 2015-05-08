var id = require('vigour-js/util/id')
  , Server;

var Client = module.exports = function(socket){
  Server = Server || require('./');
  this.socket = socket;
  this.id = id('socket-');

  this.socket.on('disconnect', this.destroy.bind(this) );
};

Client.prototype.destroy = function(){
  Server.removeClient(this.id);
};
