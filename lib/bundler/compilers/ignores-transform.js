var fs = require('graceful-fs') 
  , path = require('path')
  , through = require('through2')
  , backtrackFile = require('../../utils/backtrack-file')
  , rEx = /require\(.+\.less[\'\"](.+)?\)/g
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss']
  , ignoreList = require( backtrackFile('package.json') ).browserifyIgnores || {};

module.exports = function(Bundle){
  return function(file){
    var ignores = ignoreList.dev || [];
    if(Bundle.building){
      ignores = ignores.concat(ignoreList.build || []);
    }
    if(Bundle.testing){
      ignores = ignores.concat(ignoreList.test || []);
    }
    return through(function(buf, enc, next){
      for(var i = 0, len = ignores.length; i < len; i++){
        if( ~file.indexOf('node_modules/'+ ignores[i]) ){
          return this.push(null);
        }
      }
      this.push(buf);
      next();
    });
  };
};

