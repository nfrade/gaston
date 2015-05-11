var fs = require('graceful-fs') 
  , path = require('path')
  , through = require('through2')
  , rEx = /(\/\/)?(\ +)?(\ +)?(require\((.+)?[\'\"](.+(\.less))[\'\"](.+)?\))/g
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss'];


module.exports = function(Bundler){
  return function(file){
    return through(function(buf, enc, next){

      var str = buf.toString('utf8');
      var match, fileLocation, mappedFile = false;
      while( match = rEx.exec(str) ){
        if( ~match[0].indexOf('//') ){
          continue;
        }
        if(!mappedFile){
          fileLocation = file.split(path.sep);
          fileLocation.pop();
          fileLocation = fileLocation.join(path.sep);
          Bundler.cssFileMappings[file] = [];
          mappedFile = true;
        }

        var cssObj = {
          cssPath: path.join(fileLocation, match[6]),
          basePath: fileLocation
        };

        Bundler.cssFileMappings[file].push( cssObj );
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

