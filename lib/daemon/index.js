var log = require('npmlog')
  , os = require('os')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , http = require('http')
  , minimist = require('minimist')
  , SocketIO = require('socket.io')
  , gaston = require('../')
  , config = require('../../config.json')
  , basePath = process.cwd()
  , registry = {};

var args = minimist( process.argv );
var port = module.exports.port = args.api || config['api-port'];

var server = http.createServer();
var io = SocketIO( server );

io.on('start', function(){
  console.log('starting io')
});

io.on('connect', function(socket){
  registerAPI(socket);
});

server.listen(port, function(){
  log.info('gaston', 'API is listening on port', port);
});

var registerAPI = function registerAPI(socket){
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

//Start the Daemon
gaston.connected
  .then( compileNakedGaston )
  .then( gaston.start )
  .then(function(){
    log.info('gaston', 'is now running as a daemon');
  })
  .catch(function(err){
    log.error('gaston', err);
    process.exit(1);
  });

