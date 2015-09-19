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
    var currentConfig = Config.configs[Config.current || 'gaston'];
    var projectConfig = Config.configs[project] || {};
    var config = _.merge( currentConfig, projectConfig );
    config.ip = ip.address();
    return config;
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