var path = require('path');

var getBasePath = module.exports = function getBasePath(original, config){
  var basePath = original;
  if( basePath ){
    return path.join( process.cwd(), basePath )
  }

  basePath = config['base-path'];
  if(basePath){
    if(basePath.indexOf(path.sep) === 0){
      return basePath;
    }
    var homeDir = process.env.HOME || process.env.USERPROFILE;
    return path.join( homeDir, basePath );
  }
  return process.cwd();
};