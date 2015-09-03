var log = require('npmlog')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , Promise = require('bluebird')
  , http = require('http')
  , SocketIO = require('socket.io')
  , registry = {}

var server = http.createServer();
var io = SocketIO( server );

io.on('connect', function(socket){
  registerAPI(socket);
});

var API = module.exports = {
  running: false,
  registry: registry,
  start: function start(options){
    API.port = options.port;
    return new Promise(function(fulfill, reject){
      server.listen(API.port, function(){
        API.running = true;
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


var registerAPI = function registerAPI(socket){
  var keys = Object.keys( registry );
  for(var i = 0, l = keys.length; i < l; i++){
    var key = keys[i];
    var callback = registry[key].bind(socket);
    socket.on(key, callback);
  };
};

var registryPath = path.join(__dirname, 'registry');
fs.readdirAsync( registryPath )
  .then(function(files){
    for( var i = 0, l = files.length; i < l; i++ ){
      var file = files[i];
      if( path.extname(file) !== '.js'){
        return;
      }
      var evName = file.replace('.js', '');
      var reqPath = path.join( registryPath, file );
      registry[ evName ] = require( reqPath );
    }
  });

