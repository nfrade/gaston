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

    this.config = (localStorage.getItem('gaston') && JSON.parse( localStorage.getItem('gaston') ) ) || {};

    if( this.config.remote && this.config.server ){
      var server = this.config.server;
      if(server.ip !== this.server.ip || server.port !== this.server.port){
        var script = document.createElement('script');
        var buster = Math.floor(Math.random() * 999999);
        script.src = 'http://' + server.ip + ':' + server.port + '/bundle.js?' + buster;
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
    // ui.init();

    require('gaston-application');
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
    this.config[key] = value;
    localStorage.setItem('gaston', JSON.stringify(this.config) );
  },

  get: function(key){
    return this[key];
  }, 

  reset: function(){
    localStorage.setItem( 'gaston', JSON.stringify({}) );
  },

  identify: function(){
    gaston.emit('identify-clients');
  },

  remote: function(server){
    if(server){
      gaston.set('server', server);
      gaston.set('remote', true);
    } else {
      gaston.set('remote', !gaston.config.remote);
    }
  }

};

var onConnect = function(){
  gaston.hasConnected = true;
  var config = ua;
  gaston.emit('register', config);
  console.info('successfully connected to socket-server on ', gaston.serverAddress);
  log.init();
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
    setTimeout(function(){
      window.location.reload();
    }, 200);
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



