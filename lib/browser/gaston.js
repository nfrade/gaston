var io = require('socket.io-client')
  , ua = require('user-agent')
  , sillyname = require('sillyname')
  , idDiv;

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
    gaston.connect( server );
    setAPI();
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
  var config = ua;
  config.id = sillyname();
  idDiv.textContent = 'gaston ID: ' + config.id;
  idDiv.style.display = 'block';
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
      document.body.innerHTML = payload.message;
    }
    console.info('server-message', payload)
  });
};

(function(){
  idDiv = document.createElement('div');
  idDiv.style.display = 'none';
  idDiv.style.position = 'fixed';
  idDiv.style.zIndex = 9999999999;
  idDiv.style.background = '#000';
  idDiv.style.color = '#fff';
  idDiv.style.bottom = 0;
  idDiv.style.right = 0;
  idDiv.style.padding = '10px';
  document.body.appendChild(idDiv);
  idDiv.addEventListener('click', function(){
    document.body.removeChild(this);
  })
})();

gaston.init();