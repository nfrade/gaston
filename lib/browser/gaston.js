var io = require('socket.io-client');

//this properties are filled by browserify transform
var server = {
  ip: '{{socketServer.ip}}',
  port: '{{socketServer.port}}'
};

var gaston = window.gaston = module.exports = {
  serverAddress: undefined,
  socket: undefined,
  clientId: undefined,
  inited: false,
  connected: false,
  init: function(){
    if(this.inited){
      return false;
    }
    this.inited = true;
    gaston.connect( 'http://' + server.ip + ':' + server.port );
    setAPI();
  },

  connect: function(serverAddress){
    if(gaston.connected){
      gaston.disconnect();
    }
    this.serverAddress = serverAddress;
    gaston.socket = io(serverAddress);
    gaston.on('connect', onConnect);
    gaston.on('connect_error', onConnectError);
    gaston.on('authenticated', onAuthenticated);
  },

  disconnect: function(){
    gaston.socket.disconnect();
    this.clientId = null;
    this.connected = false;
  },
  
  on: function(ev, handler){
    gaston.socket.on(ev, handler);
  },
  emit: function(message, payload){
    gaston.socket.emit(message, payload);
  }
};

var onConnect = function(){
  console.info('successfully connected to socket-server on ', gaston.serverAddress);
};

var onConnectError = function(err){
  console.log('error connecting to socket server', gaston.serverAddress);
  console.error(err);  
};

var onAuthenticated = function(payload){
  gaston.connected = true;
  gaston.clientId = payload.id;
};

var setAPI = function(){
  gaston.build = gaston.emit.bind(null, 'build');
  gaston.on('reload', function(){
    window.location.reload();
  })
}


gaston.init();