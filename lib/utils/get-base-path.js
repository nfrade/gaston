var path = require('path');

var getBasePath = module.exports = function getBasePath(basePath){
  if(basePath.indexOf(path.sep) === 0){
    return basePath;
  }
  var homeDir = process.env.HOME || process.env.USERPROFILE;
  return path.join( homeDir, basePath );
};