var fs = require('graceful-fs') 
  , path = require('path')
  , through = require('through2');
var count = 0;

module.exports = function(Bundler){
  
  var fullDirPath = Bundler.dirPath;
  var requireName = fullDirPath.split(path.sep).pop();

  var regExp = new RegExp('require\\(\\ ?[\'\"]' + requireName, 'g');
  var replacement = "require('" + fullDirPath;
  return function(file){
    return through(function(buf, enc, next){
      var str = buf.toString('utf8');
      this.push( str.replace(regExp, replacement) );
      next();
    });
  };
}