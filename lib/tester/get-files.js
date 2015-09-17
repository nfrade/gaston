var path = require('path')
  , Promise = require('bluebird')
  , fs = require('vigour-fs-promised')
  , config = require('../config');

module.exports = getFiles;


function getFiles (basePath) {
  var files = [];

  if(path.extname(basePath)){
    var file = basePath;
    if( !~file.indexOf(config.basePath) ){
      file = path.join(config.basePath, file);
    }
    files.push(file);
    return Promise.resolve(files);
  }

  if( !fs.existsSync(basePath) ){
    return Promise.resolve(files);
  }

  (function recur(base){
    var list = fs.readdirSync(base);
    for(var i = 0, l = list.length; i < l; i++){
      var file = path.join( base, list[i] );
      if(path.extname(file) === '.js'){
        if( !~file.indexOf('bundle.js') && !~file.indexOf('build.js') ){
          files.push(file);
        }
      }
      var stat = fs.statSync(file);
      if( stat.isDirectory(file) ){
        recur(file);
      }
    }
  })(basePath);

  return Promise.resolve( files );
}
