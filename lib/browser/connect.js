var gaston = window.gaston
, io = require('socket.io-client')
, API = require('./api')
, ua = require('./user-agent');

gaston.connect = function(server){
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
  API.init();
};

gaston.disconnect = function(){
  gaston.socket.disconnect();
  this.clientId = null;
  this.connected = false;
};

var onConnect = function(){
  gaston.hasConnected = true;
  gaston.emit('register', gaston.config.ua);
  console.info('successfully connected to gaston on ', gaston.serverAddress);
};

var onConnectError = function(err){
  console.error('error connecting to socket server', gaston.serverAddress);
};

var onAuthenticated = function(payload){
  console.log('authenticated', payload);
  gaston.connected = true;
  gaston.clientId = payload.id;
};