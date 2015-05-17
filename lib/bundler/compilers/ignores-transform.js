var through = require('through2')
  , backtrackFile = require('../../utils/backtrack-file')
  , Bundler = require('../')
  , config = require('../../config');

var ignores = config.gaston['ignore-requires'] || {};

module.exports = function(file){
  var ignoresList = ignores.dev || [];
  if(Bundler.isBuilding){
    ignoresList = ignoresList.concat(ignores.build || []);
  }
  if(Bundler.testing){
    ignoresList = ignoresList.concat(ignores.test || []);
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

