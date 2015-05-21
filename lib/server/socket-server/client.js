var log = require('npmlog')
  , SocketServer
  , gaston
  , maxId = 0;

var Client = module.exports = function(socket){
  SocketServer = SocketServer || require('./');
  gaston = gaston || require('../../gaston');

  this.socket = socket;

  this.socket.on( 'disconnect', this.destroy.bind(this) );
  this.socket.on( 'register', onRegister.bind(this) );

  this.setAPI();
};

Client.prototype.setAPI = function(){
  var self = this;
  this.socket.on('clients', function(){
    self.socket.emit('clients', SocketServer.getClients() );
  });



  this.socket.on('build', function(){
    gaston.build(require('../../bundler').dirPath )
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
  SocketServer.removeClient(this);
};


var onRegister = function(client){
  this.id = client.id;
  this.browser = client.browser;
  this.version = client.version;
  this.prefix = client.prefix;
  this.platform = client.platform;
  this.device = client.device;
  SocketServer.addClient(this);
  log.info('socket-server', 'new client', this.id, this.platform, this.browser);
};
