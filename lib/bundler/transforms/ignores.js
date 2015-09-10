var through = require('through2')
  config = { gaston: {} }; //[TODO] find out where to get the config

var ignores = config.gaston['ignore-requires'] || [];

module.exports = function(file){
  
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

