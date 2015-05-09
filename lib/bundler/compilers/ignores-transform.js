var through = require('through2')
  , backtrackFile = require('../..//utils/backtrack-file')
  , ignoreList = require( backtrackFile('package.json') ).browserifyIgnores || {};

module.exports = function(Bundler){
  return function(file){
    var ignores = ignoreList.dev || [];
    if(Bundler.building){
      ignores = ignores.concat(ignoreList.build || []);
    }
    if(Bundler.testing){
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

