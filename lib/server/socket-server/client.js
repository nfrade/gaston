var log = require('npmlog')
  , SocketServer
  , gaston = gaston || require('../../gaston')
  , maxId = 0;

var Client = module.exports = function(socket){
  SocketServer = SocketServer || require('./');

  this.socket = socket;

  this.socket.on( 'disconnect', this.destroy.bind(this) );
  this.socket.on( 'register', onRegister.bind(this) );

  this.setAPI();
};

//define a getter and setter for id (emits when set) handles change on id
Object.defineProperty(Client.prototype, 'id', {
  set:function(val) {
    this._id = val;
    this.socket.emit('id', val);
  },
  get:function() {
    return this._id;
  }
});

Client.prototype.setAPI = function(){
  var self = this; 
  this.socket.on('clients', function(){
    self.socket.emit('clients', SocketServer.getClients() );
  });

  this.socket.on('id', function(payload) {
    self.id = payload;
  });

  this.socket.on('identify-clients', function(){
    SocketServer.broadcast('identify-clients');
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
};

Client.prototype.destroy = function(){
  SocketServer.removeClient(this);
};

//named functions are better for debugging
function onRegister(client){
  this.id = client.id;
  this.browser = client.browser;
  this.version = client.version;
  this.prefix = client.prefix;
  this.platform = client.platform;
  this.device = client.device;
  SocketServer.addClient(this);
  log.info('socket-server', 'new client', this.id, this.platform, this.browser);
}
