var fs = require('vigour-fs-promised')
  , path = require('path')

module.exports = function getConfigFiles(configPath){
  var Config = this;
  return fs.readdirAsync( Config.path )
    .then(function(files){
      return files.filter(function(item){
        return  path.extname(item) === '.json';
      });
    });
};