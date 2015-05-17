var through = require('through2')
  , backtrackFile = require('../../utils/backtrack-file')
  , Bundler = require('../')
  , config = require('../../config');

var ignores = config.gaston['ignore-requires'] || {};

module.exports = function(file){
  if(Bundler.isBuilding){
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

