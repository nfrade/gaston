var ua = require('../../utils/user-agent')
  , SocketServer
  , gaston
  , maxId = 0;

var Client = module.exports = function(socket){
  SocketServer = SocketServer || require('./');
  gaston = gaston || require('../../gaston');

  this.socket = socket;

  this.socket.on( 'disconnect', this.destroy.bind(this) );
  this.socket.on( 'authenticate', onAuthenticate.bind(this) );

  this.setAPI();
};

var onAuthenticate = function(){
  var self = this;
  this.socket.on('authenticate', function(payload){
    var createdAt = new Date(payload.createdAt);
    if(!payload.id || new Date() - payload.createdAt > 24*60*60*1000){
      self.id = (""+Math.random()).substr(2, 5);
      self.createdAt = new Date();
    } else {
      self.id = payload.id;
      self.createdAt = payload.createdAt;
    }
    self.ua = ua.parse(payload.userAgentString);
    SocketServer.addClient(self);
    var clients = SocketServer.getClients();
    self.socket.emit( 'authenticated', clients[ clients.length-1] );
  });
}


Client.prototype.setAPI = function(){
  var self = this;
  this.socket.on('connected-clients', function(){
    console.log('connected clients: ', SocketServer.getClients());
  });



  this.socket.on('build', function(){
    gaston.build( require('../../bundler').dirPath )
      .then(function(version){
        Bundler.building = false;
        socket.emit('build-complete', { version: version });
      })
      .catch(function(err){
        log.info('build', err);
      });
  });
}

Client.prototype.destroy = function(){
  SocketServer.removeClient(this.id);
};
