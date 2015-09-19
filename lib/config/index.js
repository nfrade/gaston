var fs = require('vigour-fs-promised')
  , path = require('path')
  , os = require('os')
  , ip = require('ip')
  , _ = require('lodash')
  , homedir = os.homedir();

var Config = module.exports = {
  configs: {},
  path: path.join(homedir, '.gaston', 'config'),
  current: undefined,
  parseConfig: require('./utils/parse-config'),
  getConfigFiles: require('./utils/get-config-files'),
  init: function(){
    var configNames;
    return Config.getConfigFiles()
      .then(function(files){
        configNames = files.map(function(item){
          return item.replace('.json', '');
        });
        return configNames;
      })
      .then( Config.parseConfig.bind(Config) )
      .then(function(results){
        for(var i = 0, l = configNames.length; i < l; i++){
          Config.configs[ configNames[i] ] = results[i];
        }
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

