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
      .then(function(){
        return httpServer.start(config);
      })
      .then( compileNakedGaston )
      .then( Daemon.backupConfig );
  },
  stop: function(){
    return new Promise(function(resolve, reject){
      return httpServer.stop()
        .then(function(){
          Daemon.server.close();
          resolve();
        })
    });
  },
  restart: function(config){
    return Daemon.stop()
      .then(function(){
        return Daemon.start(config);
      });
  },
  backupConfig: function(){
    return new Promise(function(resolve, reject){
      var configPath = path.join(__dirname, '../..', 'config.json');
      var backupPath = path.join(__dirname, '../..', 'last-config.json');
      var rs = fs.createReadStream(configPath);
      var ws = fs.createWriteStream(backupPath);
      ws.on('close', resolve );
      rs.pipe(ws);
    });
  }, 
  restoreConfig: function(){
    return new Promise(function(resolve, reject){
      var configPath = path.join(__dirname, '../..', 'config.json');
      var backupPath = path.join(__dirname, '../..', 'last-config.json');
      var rs = fs.createReadStream(backupPath);
      var ws = fs.createWriteStream(configPath);
      var configStr = '';
      rs.on('data', function(buf){
        configStr += buf.toString('utf8');
      });
      ws.on('close', function(){
        resolve( JSON.parse(configStr) );
      });
      rs.pipe(ws);
    });
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

var compileNakedGaston = function compileNakedGaston(){
  return new Promise(function(resolve, reject){
    var gastonPath = path.join(__dirname, '..', 'bundler/dummys', 'index.js');
    var bundleOptions = { 
      source: gastonPath, 
      gaston: true, 
      naked: true
    };
    return gaston.bundle( bundleOptions )
      .then(function(bundle){
        var gastonPath = path.join( require('os').tmpdir(), 'naked-gaston.js' );
        return fs.writeFileAsync(gastonPath, bundle.js, 'utf8')
      })
      .then( resolve )
      .catch( reject );
  });
};
