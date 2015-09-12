var log = require('npmlog')
  , os = require('os')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , http = require('http')
  , SocketIO = require('socket.io')
  , httpServer = require('../http-server')
  , client = require('../io-client')
  , gaston = require('../')
  , basePath = process.cwd()
  , registry = {};

var Daemon = module.exports = {
  server: undefined,
  listener: undefined,
  io: undefined,
  port: undefined,
  connections: [],
  start: function(config){ 
    Daemon.port = config['api-port'];
    return launchDaemon()
      .then( compileNakedGaston )
      .then(function(){
        return httpServer.start(config);
      });
  },
  stop: function(){
    return httpServer.stop();
  }
};

var launchDaemon = function(){
  return new Promise(function(resolve, reject){
    var server = Daemon.server = http.createServer();
    var io = Daemon.io = SocketIO( server );
    io.on('connect', onConnection);
    Daemon.listener = server.listen(Daemon.port, resolve);
  });
};

var onConnection = function registerAPI(socket){

  Daemon.connections.push(socket);
  socket.on('close', onSocketClose);

  var keys = Object.keys( registry );
  for(var i = 0, l = keys.length; i < l; i++){
    var key = keys[i];
    var callback = registry[key].bind(socket);
    socket.on(key, callback);

    socket.on('error', function(err){
      log.error('gaston', err);
      process.exit(1);
    })
  };
};

var onSocketClose = function onSocketClose(){
  var self = this;
  Daemon.connections = Daemon.connections.filter(function(socket){
    return socket !== this;
  });
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

var compileNakedGaston = function compileNakedGaston(){
  return new Promise(function(resolve, reject){
    var gastonPath = path.join(__dirname, '..', 'browser', 'dummy.js');
    return gaston.bundle( { source: gastonPath, gaston: true })
      .then(function(bundle){
        var gastonPath = path.join( require('os').tmpdir(), 'naked-gaston.js' )
        return fs.writeFileAsync(gastonPath, bundle.js, 'utf8')
      })
      .then( resolve )
      .catch( reject );
  });
};
