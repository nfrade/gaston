var fs = require('graceful-fs') 
  , path = require('path')
  , through = require('through2')
  , Promise = require('promise')
  , rEx = /require\(.+\.less[\'\"](.+)?\)/g
  , CSS_EXTENSIONS = ['.css', '.less', '.sass', '.scss'];


module.exports = function(Bundler){
  return function(file){
    return through(function(buf, enc, next){
      if( ~CSS_EXTENSIONS.indexOf( path.extname(file) ) ){
        this.push(null);
        Bundler.addLessFile({
          path: file,
          css: buf.toString('utf8')
        });
        return next();
      }
      this.push(buf);
      Bundler.Watcher.addWatcher(file);
      next();
    });
  };  
}

