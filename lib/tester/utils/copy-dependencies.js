var fs = require('vigour-fs-promised')
  , path = require('path')

module.exports = function copyDependencies(deps, target){
    var total = 0;

  return new Promise(function(resolve, reject){
    var onStreamClosed = function onStreamClosed(){
      if(++total === deps.length){
        resolve();
      }
    };

    for( var i = 0, l = deps.length; i < l; i++){
      var source = path.join( __dirname, '../../..', (deps[i]) );
      var fileName = deps[i].split(path.sep).pop();
      var copyTo = path.join( target,  fileName);
      var rs = fs.createReadStream(source);
      var ws = fs.createWriteStream(copyTo);
      rs.on('close', onStreamClosed);
      rs.pipe(ws);
    }
  });
};