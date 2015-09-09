var log = require('npmlog')
  , path = require('path')
  , fs = require('vigour-fs-promised')
  , Promise = require('bluebird')
  , registry = {}

var registerAPI = module.exports.register = function registerAPI(socket){
  var keys = Object.keys( registry );
  for(var i = 0, l = keys.length; i < l; i++){
    var key = keys[i];
    var callback = registry[key].bind(socket); //console.log('registering', key, callback)
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

