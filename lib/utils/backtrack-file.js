var log = require('npmlog')
  , fs = require('graceful-fs')
  , path = require('path')

module.exports = function(fileName, origPath, limit){
  var count = 0
    , limit = limit || 10;
  function walk(basePath){
    var searchPath = path.join(basePath, fileName);
    var exists = fs.existsSync(searchPath);
    if(exists){
      return searchPath;
    } else {
      if(count++ < 10){
        return walk( path.join(basePath, '/..') );
      }
    }
  }
  return walk( origPath || process.cwd() );
}