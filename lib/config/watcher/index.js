var fs = require('vigour-fs-promised')
  , path = require('path')
  , chokidar = require('chokidar')
  , ignoreRegex = /((?!\.json$)(\..{1,10}))$/;

var Watcher = module.exports = {
  init: function(configPath){
    return new Promise(function(resolve, reject){
      var options = { ignored: ignoreRegex }
      var watcher = chokidar.watch(configPath, options);
      watcher
        .on( 'add', onChange )
        .on( 'change', onChange )
        .on( 'unlink', onUnlink )
        .on( 'ready', resolve )
        .on( 'error', reject );
    });
  }
};

var onChange = function(file){
  fs.readJSONAsync(file)
    .then(function(obj){
      var name = getNameFromFile(file);
      Config.configs[name] = obj;
    })
};

var onUnlink = function(file){
  var name = getNameFromFile(file);
  Config.configs[name] = null;
};

var getNameFromFile = function getNameFromFile(file){
  return file.split(path.sep).pop().replace('.json', '');
}