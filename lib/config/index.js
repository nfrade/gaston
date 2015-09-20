var fs = require('vigour-fs-promised')
  , path = require('path')
  , os = require('os')
  , ip = require('ip')
  , _ = require('lodash')
  , Watcher = require('./watcher')
  , homedir = process.env.USERPROFILE || process.env.HOME;

var Config = module.exports = {
  configs: {},
  path: path.join(homedir, '.gaston', 'config.json'),
  current: undefined,
  init: function(){
    return Watcher.init(Config.path);
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
      if( fs.existsSync(packagePath) ){
        var package = fs.readFileSync(packagePath, 'utf8');
        package = JSON.parse(package);
        projectConfig = projectConfig = package.gaston || {};
      }
    }

    var config = _.extend(Config.configs.gaston, projectConfig);
    config.ip = ip.address();
    return config;
  }
};
