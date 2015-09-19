var path = require('path')
  , fs = require('vigour-fs-promised')

module.exports = function parseConfig(names){
  var Config = this;
  names = Array.isArray(names)? names : [names];
  var promises = [];
  for(var i = 0, l = names.length; i < l; i++){
    var thisPath = path.join( Config.path, names[i] + '.json' );
    promises.push( fs.readJSONAsync(thisPath) );
  }
  return Promise.all(promises);
};