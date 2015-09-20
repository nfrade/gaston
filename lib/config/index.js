var fs = require('vigour-fs-promised')
  , path = require('path')
  , os = require('os')
  , ip = require('ip')
  , _ = require('lodash')
  , Watcher = require('./watcher')
  , homedir = process.env.USERPROFILE || process.env.HOME;

var Config = module.exports = {
  configs: {},
  path: path.join(homedir, '.gaston', 'config'),
  current: undefined,
  init: function(){
    return new Promise(function(resolve, reject){
      Watcher.init(Config.path)
        .then( waitForConfig.bind(null, resolve) );
    });
  },
  get: function(project){
    var packagePath, projectConfig = {};
    var registry = require('../http-server/middleware').registry;
    
    if(registry){
      var registryKeys = Object.keys( registry );
      for(var i = 0, l = registryKeys.length; i < l; i++){
        var key = registryKeys[i];
        if( registry[key].name === project){
          packagePath = registry[key].packagePath;
          break;
        }
      }
    }

    if( packagePath ){
      var package = fs.readFileSync(packagePath, 'utf8');
      package = JSON.parse(package);
      projectConfig = projectConfig = package.gaston || {};
      return projectConfig;
    }

    var currentConfig = Config.configs[Config.current || 'gaston'];
    currentConfig.ip = ip.address();
    return currentConfig;
  },
  list: function(){
    return Config.getConfigFiles();
  }
};

// [TODO] this is a horrible horrible hack
var waitForConfig = function(resolve){
  setTimeout(function(){
    if(Config.configs.gaston){
      return resolve();
    }
    waitForConfig(resolve);
  }, 50)
}