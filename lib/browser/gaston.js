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
  },
  build: function(){
    gaston.emit('build');
  },

  set: function(key, value){

  },
  get: function(){

  }
};

var onConnect = function(){
  var config = JSON.parse( localStorage.getItem('gaston') ) || {};
  gaston.set('userAgentString', config.userAgentString || (navigator && navigator.userAgentString) || '');
  
  gaston.emit('authenticate', config);
  console.info('successfully connected to socket-server on ', gaston.serverAddress);
};

var onConnectError = function(err){
  console.log('error connecting to socket server', gaston.serverAddress);
  console.error(err);  
};

var onAuthenticated = function(payload){
  console.log('authenticated', payload);
  gaston.connected = true;
  gaston.clientId = payload.id;
  gaston.ua
};

var setAPI = function(){
  gaston.on('build-complete', function(payload){
    console.info('build complete. Current version:', payload.version)
  });
  gaston.on('reload', function(){
    window.location.reload();
  });
}


gaston.init();