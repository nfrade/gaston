var io = require('socket.io-client')
  , ua = require('user-agent');

//this properties are filled by browserify transform
var server = {
  ip: '{{socketServer.ip}}',
  port: '{{socketServer.port}}'
};

var gaston = window.gaston = module.exports = {
  serverAddress: '',
  socket: undefined,
  clientId: undefined,
  inited: false,
  connected: false,

  init: function(){
    if(this.inited){
      return false;
    }
    this.inited = true;
    if( server.ip !== '{{socketServer.ip}}' ){
      gaston.connect( server );
      setAPI();
    } else {
      //dev/preview/src/init.js is querying for this...
      this.serverAddress = '{';
    }
  },

  connect: function(server){
    if(gaston.connected){
      gaston.disconnect();
    }
    this.server = server;
    this.serverAddress = 'ws://' + server.ip + ':' + server.port;
    gaston.socket = io(this.serverAddress);
    gaston.on('connect', onConnect);
    gaston.on('connect_error', onConnectError);
    gaston.on('registered', onAuthenticated);
  },

  disconnect: function(){
    gaston.socket.disconnect();
    this.clientId = null;
    this.connected = false;
  },
  
  on: function(ev, handler){
    console.log('ho ho ho', ev)
    gaston.socket.on(ev, handler);
  },

  emit: function(message, payload){
    console.log('hey hey hey', message, gaston.socket)
    gaston.socket.emit(message, payload);
  },

  build: function(){
    gaston.emit('build');
  },

  set: function(key, value){

  },

  get: function(){

  }, 

  identify: function(){
    gaston.emit('identify-clients');
  }

};

var onConnect = function(){
  var config = ua;
  gaston.emit('register', config);
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
};

var setAPI = function(){
  gaston.on('build-complete', function(payload){
    console.info('build complete. Current version:', payload.version)
  });

  gaston.on('clients', function(clients){
    console.info('connected clients: ', clients);
  });

  gaston.on('reload', function(){
    window.location.reload();
  });

  gaston.on('server-message', function(payload){
    if(payload.type === 'error'){
      document.body.innerHTML = '<div class="gaston-error">'+payload.message+'</div>';
    }
    console.info('server-message', payload);
  });
};

Object.defineProperty(gaston, 'id', {
  set:function(val) {
    this._id = val
    this.socket.emit('id', val)
  },
  get:function() {
    return this._id
  }
});

//easier for now to require this here (wrong order ofc should be an extension)

gaston.init();

// this does not work now veyr weird 
// var log = require('../log/client')

var log = require('./log')


