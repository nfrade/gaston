var log = require('npmlog')
  , fs = require('vigour-fs-promised')
  , path = require('path')
  , chokidar = require('chokidar')
  , daemon = require('../../daemon')
  , ignoreRegex = /((?!\.json$)(\..{1,10}))$/;

var Watcher = module.exports = {
  init: function(configPath){
    return new Promise(function(resolve, reject){
      var options = { ignored: ignoreRegex }
      var watcher = chokidar.watch(configPath, options);
      watcher
        .on( 'change', onChange )
        .on( 'add', function(file){
          return onChange(file)
            .then(resolve);
        })
    });
  }
};

var onChange = function(file){
  return fs.readJSONAsync(file)
    .then(function(obj){ 
      Config.configs['gaston'] = obj;
    })
    .then( daemon.restart )
    .then(function(ignore){
      if( !ignore ){
        log.info('gaston', 'daemon restarted with the new settings');
      }
    });
};
