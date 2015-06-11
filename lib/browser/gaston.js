var io = require('socket.io-client')
  , ua = require('./user-agent')
  , ui = require('./gaston-ui')
  , log = require('./log');

var gaston = window.gaston = module.exports = {
  server: {
    ip: '{{gaston.ip}}',
    port: '{{gaston.port}}',
    socket: '{{gaston.socket}}'
  },
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

    if( localStorage['gaston-server'] ){
      var server = JSON.parse( localStorage['gaston-server'] );
      if(server.ip !== gaston.server.ip || server.port !== gaston.server.port){
        var script = document.createElement('script');
        script.src = '//' + server.ip + ':' + server.port + '/bundle.js';
        document.head.appendChild(script);
        return;
      }
    }

    if( this.server.ip !== '{{socketServer.ip}}' ){
      gaston.connect();
    } else {
      //dev/preview/src/init.js is querying for this...
      this.serverAddress = '{';
    }
    ui.init();
  },

  connect: function(server){
    server = server || this.server;
    var ip = server.ip || '127.0.0.1';
    var port = server.port || '8080';
    var socket = server.socket || '9001';
    if(gaston.connected){
      gaston.disconnect();
    }
    this.server = server;
    this.serverAddress = 'ws://' + server.ip + ':' + server.socket;
    gaston.socket = io(this.serverAddress);
    gaston.on('connect', onConnect);
    gaston.on('connect_error', onConnectError);
    gaston.on('registered', onAuthenticated);
    setAPI();
  },

  disconnect: function(){
    gaston.socket.disconnect();
    this.clientId = null;
    this.connected = false;
  },
  
  on: function(ev, handler){
    if(!gaston.socket){
      return;
    }
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
    this[key] = value;
    if(typeof value !== 'string'){
      value = JSON.stringify(value);
    }
    localStorage.setItem('gaston-'+key, value);
  },

  get: function(key){
    return this[key];
  }, 

  identify: function(){
    gaston.emit('identify-clients');
  }

};

var onConnect = function(){
  var config = ua;
  gaston.emit('register', config);
  gaston.connected = true;
  console.info('successfully connected to socket-server on ', gaston.serverAddress);
  require('gaston-application');
  log.init();
};

var onConnectError = function(err){
  console.log('error connecting to socket server', gaston.serverAddress);
  console.error(err);
  if(!gaston.connected){
    gaston.disconnect();
  }
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
    this._id = val;
    this.socket.emit('id', val);
  },
  get:function() {
    return this._id;
  }
});

gaston.init();



