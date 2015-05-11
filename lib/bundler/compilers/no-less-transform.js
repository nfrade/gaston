var fs = require('graceful-fs') 
  , path = require('path')
  , through = require('through2')
  , rEx = /require\((.+)?[\'\"](.+(\.less))[\'\"](.+)?\)/g
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss'];


module.exports = function(Bundler){
  return function(file){
    return through(function(buf, enc, next){

      var str = buf.toString('utf8');
      var match, fileLocation, mappedFile = false;
      while( match = rEx.exec(str) ){
        if(!mappedFile){
          fileLocation = file.split(path.sep);
          fileLocation.pop();
          fileLocation = fileLocation.join(path.sep);
          Bundler.cssFileMappings[file] = [];
          mappedFile = true;
        }
        Bundler.cssFileMappings[file].push( {
          cssPath: path.join(fileLocation, match[2]),
          basePath: fileLocation
        });
      }

      if( ~CSS_EXTENSIONS.indexOf( path.extname(file) ) ){
        this.push(null);
        return next();
      }
      this.push(buf);
      if(!Bundler.building){
        Bundler.Watcher.addWatcher(file);
      }
      next();
    });
  };  
}

