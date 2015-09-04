var log = require('npmlog')
  , Promise = require('bluebird')
  , http = require('http')
  , SocketIO = require('socket.io')
  , PORT = 645701

var server = http.createServer();
var io = SocketIO( server );

var registry = {
  test: function test(payload){
    console.log('test', payload);
  },
  bundle: function bundle(payload){
    console.log('bundle', payload);
  },
  build: function build(payload){
    console.log('build', payload);
  }
};

var API = module.exports = {
  running: false,
  registry: registry,
  start: function start(port){
    API.port = port || PORT;
    return new Promise(function(fulfill, reject){
      server.listen(API.port, function(){
        log.info('API Server is listening on port', API.port);
        API.running = true;
        registerAPI();
        fulfill();
      });
    });
  },
  stop: function stop(){
    return new Promise(function(fulfill, reject){
      server.close(function(){
        log.info('API Server closed');
        API.running = false;
        io.close();
        fulfill();
      });
    });
  }
};


var registerAPI = function registerAPI(){
  var keys = Object.keys( registry );
  for(var i = 0, l = keys.length; i < l; i++){
    var key = keys[i];
    var callback = registry[key];
    io.on(key, callback);
  };
};